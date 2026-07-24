package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.LiveOddsResponseDTO;
import com.swp.horseracing.dto.RaceRequestDTO;
import com.swp.horseracing.dto.RaceResponseDTO;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.BetRepository;
import com.swp.horseracing.repository.RaceRepository;
import com.swp.horseracing.repository.RegistrationRepository;
import com.swp.horseracing.repository.TournamentRepository;
import com.swp.horseracing.repository.UserRepository;
import com.swp.horseracing.repository.TransactionHistoryRepository;
import com.swp.horseracing.repository.WalletRepository;
import com.swp.horseracing.repository.AuditLogRepository;
import com.swp.horseracing.repository.PrizeConfigRepository;
import com.swp.horseracing.service.RaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RaceServiceImpl implements RaceService {

    private final RaceRepository raceRepository;
    private final TournamentRepository tournamentRepository;
    private final RegistrationRepository registrationRepository;
    private final BetRepository betRepository;
    private final UserRepository userRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final WalletRepository walletRepository;
    private final AuditLogRepository auditLogRepository;
    private final PrizeConfigRepository prizeConfigRepository;

    @Override
    @Transactional
    public RaceResponseDTO createRace(RaceRequestDTO request) {
        Tournament tournament = tournamentRepository.findById(request.getTournamentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Giải đấu với ID: " + request.getTournamentId()));

        User referee = null;
        if (request.getRefereeId() != null) {
            referee = userRepository.findById(request.getRefereeId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Trọng tài!"));
        }

        Race race = Race.builder()
                .tournament(tournament)
                .name(request.getName())
                .raceTime(request.getRaceTime())
                .status(request.getStatus() != null ? request.getStatus() : RaceStatus.PENDING)
                .referee(referee)
                .prize1(request.getPrize1())
                .prize2(request.getPrize2())
                .prize3(request.getPrize3())
                .rakePercentage(request.getRakePercentage() != null ? request.getRakePercentage() : new java.math.BigDecimal("20.00"))
                .build();

        return mapToResponseDTO(raceRepository.save(race));
    }

    @Override
    public List<RaceResponseDTO> getAllRaces() {
        return raceRepository.findAllWithDetails().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RaceResponseDTO> getRacesByTournamentId(Integer tournamentId) {
        return raceRepository.findByTournamentId(tournamentId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RaceResponseDTO getRaceById(Integer id) {
        Race race = raceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Chặng đua với ID: " + id));
        return mapToResponseDTO(race);
    }

    @Override
    @Transactional
    public RaceResponseDTO updateRace(Integer id, RaceRequestDTO request) {
        Race race = raceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Chặng đua với ID: " + id));

        if (request.getTournamentId() != null && !race.getTournament().getId().equals(request.getTournamentId())) {
            Tournament newTournament = tournamentRepository.findById(request.getTournamentId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Giải đấu mới với ID: " + request.getTournamentId()));
            race.setTournament(newTournament);
        }

        if (request.getName() != null) race.setName(request.getName());
        if (request.getRaceTime() != null) race.setRaceTime(request.getRaceTime());

        if (request.getRefereeId() != null) {
            User referee = userRepository.findById(request.getRefereeId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Trọng tài!"));
            race.setReferee(referee);
        }
        if (request.getPrize1() != null) race.setPrize1(request.getPrize1());
        if (request.getPrize2() != null) race.setPrize2(request.getPrize2());
        if (request.getPrize3() != null) race.setPrize3(request.getPrize3());
        
        if (request.getRakePercentage() != null) race.setRakePercentage(request.getRakePercentage());

        // Cập nhật trạng thái
        if (request.getStatus() != null && request.getStatus() != race.getStatus()) {
            if (request.getStatus() == RaceStatus.CANCELED) {
                cancelRaceLogic(race, "Hủy chặng đua thông qua API trực tiếp");
            }
            race.setStatus(request.getStatus());
        }

        return mapToResponseDTO(raceRepository.save(race));
    }

    // NGHIỆP VỤ HỦY BỎ CHẶNG ĐUA & HOÀN TIỀN
    private void cancelRaceLogic(Race race, String reason) {
        java.util.List<Bet> bets = betRepository.findByRaceId(race.getId());
        int totalAffected = 0;
        java.math.BigDecimal totalRefund = java.math.BigDecimal.ZERO;

        for (Bet bet : bets) {
            if (bet.getStatus() == BetStatus.PENDING) {
                bet.setStatus(BetStatus.CANCELED);
                betRepository.save(bet);

                Wallet wallet = walletRepository.findByUserIdForUpdate(bet.getSpectator().getId()).orElse(null);
                if (wallet != null) {
                    wallet.setBalance(wallet.getBalance().add(bet.getAmount()));
                    walletRepository.save(wallet);

                    TransactionHistory tx = TransactionHistory.builder()
                            .transactionCode("REFUND-RCANCEL-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                            .wallet(wallet)
                            .amount(bet.getAmount())
                            .type(TransactionType.REFUND)
                            .direction(TransactionDirection.IN)
                            .status(TransactionStatus.COMPLETED)
                            .build();
                    transactionHistoryRepository.save(tx);
                    
                    totalRefund = totalRefund.add(bet.getAmount());
                    totalAffected++;
                }
            }
        }

        // Ghi Sổ Nhật Ký (Audit Log)
        AuditLog log = AuditLog.builder()
                .action("CANCEL_RACE")
                .performedBy("ADMIN_SYSTEM")
                .reason(reason != null ? reason : "Hủy chặng đua")
                .affectedBetsCount(totalAffected)
                .totalRefundAmount(totalRefund)
                .build();
        auditLogRepository.save(log);
    }

    @Override
    @Transactional
    public void deleteRace(Integer id) {
        if (!raceRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy Chặng đua với ID: " + id);
        }
        raceRepository.deleteById(id);
    }

    private RaceResponseDTO mapToResponseDTO(Race race) {
        return RaceResponseDTO.builder()
                .id(race.getId())
                .tournamentId(race.getTournament() != null ? race.getTournament().getId() : null)
                .tournamentName(race.getTournament() != null ? race.getTournament().getName() : null)
                .name(race.getName())
                .raceTime(race.getRaceTime())
                .status(race.getStatus())
                .refereeId(race.getReferee() != null ? race.getReferee().getId() : null)
                .refereeUsername(race.getReferee() != null ? race.getReferee().getUsername() : null)
                .prize1(race.getPrize1())
                .prize2(race.getPrize2())
                .prize3(race.getPrize3())
                .rakePercentage(race.getRakePercentage())
                .totalPool(race.getTotalPool())
                .build();
    }

    @Override
    public List<LiveOddsResponseDTO> getLiveOdds(Integer raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chặng đua!"));

        java.math.BigDecimal totalPool = race.getTotalPool();
        java.math.BigDecimal rakePercentage = race.getRakePercentage();

        java.math.BigDecimal netPool = totalPool.multiply(
                java.math.BigDecimal.valueOf(100).subtract(rakePercentage)
        ).divide(java.math.BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP);

        List<Registration> registrations = registrationRepository.findByRaceId(raceId);
        List<LiveOddsResponseDTO> oddsList = new java.util.ArrayList<>();

        for (Registration reg : registrations) {
            java.math.BigDecimal totalBetOnHorse = betRepository.sumAmountByRaceIdAndRegistrationId(raceId, reg.getId());
            java.math.BigDecimal calculatedOdds = java.math.BigDecimal.ZERO;

            if (totalBetOnHorse.compareTo(java.math.BigDecimal.ZERO) > 0) {
                calculatedOdds = netPool.divide(totalBetOnHorse, 2, java.math.RoundingMode.HALF_UP);
            }

            oddsList.add(LiveOddsResponseDTO.builder()
                    .registrationId(reg.getId())
                    .horseName(reg.getHorse().getName())
                    .totalBetOnHorse(totalBetOnHorse)
                    .calculatedOdds(calculatedOdds)
                    .build());
        }

        return oddsList;
    }

    @Override
    @Transactional
    public void payoutRace(Integer raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Chặng đua!"));

        if (race.getStatus() != RaceStatus.RESULT_CONFIRMED) {
            throw new RuntimeException("Chặng đua chưa được Trọng tài chốt kết quả (Hoặc đã kết toán rồi)!");
        }

        // Tìm Registration chiến thắng (Rank = 1)
        List<Registration> registrations = registrationRepository.findByRaceId(raceId);
        Registration winnerReg = registrations.stream()
                .filter(reg -> reg.getRank() != null && reg.getRank() == 1)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Chưa có kết quả chặng đua (Chưa có ngựa Hạng 1)!"));

        // BƯỚC 1: Tính toán Net Pool (65% để trả thưởng, 35% cho admin/phí)
        java.math.BigDecimal totalPool = race.getTotalPool() != null ? race.getTotalPool() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal netPool = totalPool.multiply(new java.math.BigDecimal("0.65")).setScale(2, java.math.RoundingMode.HALF_UP);

        // Lấy tất cả bet của race
        List<Bet> allBets = betRepository.findByRaceId(raceId);
        
        // BƯỚC 2: Tính tổng tiền cược của tất cả các vé đặt vào ngựa thắng
        java.math.BigDecimal totalBetOnWinner = allBets.stream()
                .filter(b -> b.getRegistration().getId().equals(winnerReg.getId()) && b.getStatus() == BetStatus.PENDING)
                .map(b -> b.getAmount())
                .reduce(java.math.BigDecimal.ZERO, (a, b) -> a.add(b));

        // BƯỚC 3: Tính Dividend (Tỷ lệ chia thưởng)
        java.math.BigDecimal dividend = java.math.BigDecimal.ZERO;
        if (totalBetOnWinner.compareTo(java.math.BigDecimal.ZERO) > 0) {
            dividend = netPool.divide(totalBetOnWinner, 4, java.math.RoundingMode.HALF_UP);
        }

        for (Bet bet : allBets) {
            if (bet.getStatus() != BetStatus.PENDING) continue; // Bỏ qua nếu đã xử lý

            if (bet.getRegistration().getId().equals(winnerReg.getId())) {
                bet.setStatus(BetStatus.WON);
                
                // BƯỚC 4: Tiền thắng (Gross Winnings)
                java.math.BigDecimal grossWinnings = bet.getAmount().multiply(dividend).setScale(2, java.math.RoundingMode.HALF_UP);
                
                // THU THUẾ TNCN (10% cho phần thưởng > 10,000,000 VNĐ)
                java.math.BigDecimal tax = java.math.BigDecimal.ZERO;
                if (grossWinnings.compareTo(new java.math.BigDecimal("10000000")) > 0) {
                    java.math.BigDecimal taxableAmount = grossWinnings.subtract(new java.math.BigDecimal("10000000"));
                    tax = taxableAmount.multiply(new java.math.BigDecimal("0.10")).setScale(2, java.math.RoundingMode.HALF_UP);
                }
                
                // Tiền thực nhận
                java.math.BigDecimal netWinnings = grossWinnings.subtract(tax);
                bet.setReward(netWinnings); // Lưu tiền thực nhận vào vé

                // Cập nhật ví
                Wallet wallet = walletRepository.findByUserIdForUpdate(bet.getSpectator().getId())
                        .orElseThrow(() -> new RuntimeException("Lỗi ví người chơi"));
                wallet.setBalance(wallet.getBalance().add(netWinnings));
                walletRepository.save(wallet);

                // GHI LOG 1: Cộng tiền thưởng
                TransactionHistory txReward = TransactionHistory.builder()
                        .transactionCode("RW-" + java.util.UUID.randomUUID().toString().substring(0,8).toUpperCase())
                        .wallet(wallet)
                        .bet(bet)
                        .amount(grossWinnings)
                        .type(TransactionType.REWARD)
                        .direction(TransactionDirection.IN)
                        .status(TransactionStatus.COMPLETED)
                        .build();
                transactionHistoryRepository.save(txReward);
                
                // GHI LOG 2: Khấu trừ thuế (nếu có)
                if (tax.compareTo(java.math.BigDecimal.ZERO) > 0) {
                    TransactionHistory txTax = TransactionHistory.builder()
                            .transactionCode("TAX-" + java.util.UUID.randomUUID().toString().substring(0,8).toUpperCase())
                            .wallet(wallet)
                            .bet(bet)
                            .amount(tax)
                            .type(TransactionType.TAX)
                            .direction(TransactionDirection.OUT)
                            .status(TransactionStatus.COMPLETED)
                            .taxAmount(tax)
                            .build();
                    transactionHistoryRepository.save(txTax);
                }
                
            } else {
                bet.setStatus(BetStatus.LOST);
            }
            betRepository.save(bet);
        }

        // BƯỚC 5: Phân chia lợi nhuận thể thao (Chủ ngựa, Nài ngựa)
        PrizeConfig config = prizeConfigRepository.findById(1).orElse(
                PrizeConfig.builder()
                        .horseOwnerPercentage(new java.math.BigDecimal("0.05"))
                        .jockeyPercentage(new java.math.BigDecimal("0.02"))
                        .build()
        );

        java.math.BigDecimal ownerPrize = totalPool.multiply(config.getHorseOwnerPercentage()).setScale(2, java.math.RoundingMode.HALF_UP);
        if (ownerPrize.compareTo(java.math.BigDecimal.ZERO) > 0 && winnerReg.getOwner() != null) {
            Wallet ownerWallet = walletRepository.findByUserIdForUpdate(winnerReg.getOwner().getId()).orElse(null);
            if (ownerWallet != null) {
                ownerWallet.setBalance(ownerWallet.getBalance().add(ownerPrize));
                walletRepository.save(ownerWallet);
                TransactionHistory txOwner = TransactionHistory.builder()
                        .transactionCode("OWNER-" + java.util.UUID.randomUUID().toString().substring(0,8).toUpperCase())
                        .wallet(ownerWallet)
                        .amount(ownerPrize)
                        .type(TransactionType.REWARD)
                        .direction(TransactionDirection.IN)
                        .status(TransactionStatus.COMPLETED)
                        .build();
                transactionHistoryRepository.save(txOwner);
            }
        }

        if (winnerReg.getJockey() != null) {
            java.math.BigDecimal jockeyPrize = totalPool.multiply(config.getJockeyPercentage()).setScale(2, java.math.RoundingMode.HALF_UP);
            if (jockeyPrize.compareTo(java.math.BigDecimal.ZERO) > 0) {
                Wallet jockeyWallet = walletRepository.findByUserIdForUpdate(winnerReg.getJockey().getId()).orElse(null);
                if (jockeyWallet != null) {
                    jockeyWallet.setBalance(jockeyWallet.getBalance().add(jockeyPrize));
                    walletRepository.save(jockeyWallet);
                    TransactionHistory txJockey = TransactionHistory.builder()
                            .transactionCode("JOCKEY-" + java.util.UUID.randomUUID().toString().substring(0,8).toUpperCase())
                            .wallet(jockeyWallet)
                            .amount(jockeyPrize)
                            .type(TransactionType.REWARD)
                            .direction(TransactionDirection.IN)
                            .status(TransactionStatus.COMPLETED)
                            .build();
                    transactionHistoryRepository.save(txJockey);
                }
            }
        }

        // Chuyển trạng thái chặng đua thành Đã kết toán
        race.setStatus(RaceStatus.COMPLETED);
        raceRepository.save(race);
    }
}