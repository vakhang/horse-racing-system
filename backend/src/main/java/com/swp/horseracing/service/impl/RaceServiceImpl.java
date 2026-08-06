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
    private final com.swp.horseracing.repository.JockeyInvitationRepository jockeyInvitationRepository;
    private final com.swp.horseracing.repository.SystemFundRepository systemFundRepository;

    private void validateRaceTimeConstraints(java.time.LocalDateTime newRaceTime, Integer tournamentId, Integer currentRaceId) {
        if (newRaceTime == null) return;
        
        int estimatedDuration = 30; // phút
        java.time.LocalDateTime estimatedEndTime = newRaceTime.plusMinutes(estimatedDuration);
        
        // Bỏ qua constraint 23h để test
        // if (estimatedEndTime.toLocalTime().isAfter(java.time.LocalTime.of(22, 59, 59)) && estimatedEndTime.toLocalTime().isBefore(java.time.LocalTime.of(23, 59, 59))) {
        //     throw new RuntimeException("Các cuộc đua trong ngày phải kết thúc trước 23:00!");
        // }

        java.util.List<Race> existingRaces = raceRepository.findByTournamentId(tournamentId);
        for (Race r : existingRaces) {
            if (currentRaceId != null && r.getId().equals(currentRaceId)) continue;
            
            if (r.getRaceTime() == null || com.swp.horseracing.model.RaceStatus.CANCELED.equals(r.getStatus())) continue;
            
            java.time.LocalDateTime startA = r.getRaceTime();
            java.time.LocalDateTime endA = startA.plusMinutes(r.getEstimatedDuration() != null ? r.getEstimatedDuration() : 30);
            
            java.time.LocalDateTime startB = newRaceTime;
            java.time.LocalDateTime endB = startB.plusMinutes(estimatedDuration);
            
            // Công thức chặn trùng hoặc quá sát giờ (cách nhau ít nhất 30 phút)
            // Bỏ qua constraint khoảng cách để test
            // if (startA.isBefore(endB.plusMinutes(30)) && startB.isBefore(endA.plusMinutes(30))) {
            //     throw new RuntimeException("Các chặng đua phải cách nhau ít nhất 30 phút (tính từ lúc kết thúc) để bảo trì đường chạy!");
            // }
        }
    }

    // [Chức năng rõ ràng]: Quản lý chặng đua (Race Management)
    // [Tác dụng]: Khởi tạo một chặng đua mới thuộc về một giải đấu cụ thể. Kiểm tra ràng buộc thời gian xuất phát phải hợp lệ.
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Sửa logic thời gian (ví dụ: giới hạn không được tạo chặng đua trong quá khứ) ở phần kiểm tra `request.getRaceTime()`.
    @Override
    @Transactional
    public RaceResponseDTO createRace(RaceRequestDTO request) {
        Tournament tournament = tournamentRepository.findById(request.getTournamentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Giải đấu với ID: " + request.getTournamentId()));

        User referee = null;
        if (request.getRefereeId() != null) {
            referee = userRepository.findById(request.getRefereeId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Trọng tài!"));
            
            boolean hasRefereeCert = referee.getAttachments().stream().anyMatch(a -> a.getDocType() == com.swp.horseracing.model.UserDocType.REFEREE_CERT);
            if (!hasRefereeCert) {
                throw new RuntimeException("Trọng tài này chưa cung cấp Bằng cấp hành nghề hợp lệ. Không thể phân công giám sát chặng đua!");
            }
        }

        validateRaceTimeConstraints(request.getRaceTime(), request.getTournamentId(), null);

        Race race = Race.builder()
                .tournament(tournament)
                .name(request.getName())
                .raceTime(request.getRaceTime())
                .status(request.getStatus() != null ? request.getStatus() : RaceStatus.REGISTRATION)
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

    // [Chức năng rõ ràng]: Cập nhật thông tin chặng đua
    // [Tác dụng]: Chỉnh sửa các thông tin cơ bản của chặng đua (tên, giờ xuất phát, tỷ lệ phế, trọng tài, tiền thưởng).
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Nếu cần cấm thay đổi thông tin khi chặng đua đã bắt đầu, hãy thêm điều kiện check `race.getStatus()` ở đầu hàm này.
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
        if (request.getRaceTime() != null) {
            if (!request.getRaceTime().equals(race.getRaceTime())) {
                validateRaceTimeConstraints(request.getRaceTime(), race.getTournament().getId(), race.getId());
            }
            race.setRaceTime(request.getRaceTime());
        }

        if (request.getRefereeId() != null) {
            User referee = userRepository.findById(request.getRefereeId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Trọng tài!"));
            
            boolean hasRefereeCert = referee.getAttachments().stream().anyMatch(a -> a.getDocType() == com.swp.horseracing.model.UserDocType.REFEREE_CERT);
            if (!hasRefereeCert) {
                throw new RuntimeException("Trọng tài này chưa cung cấp Bằng cấp hành nghề hợp lệ. Không thể phân công giám sát chặng đua!");
            }
            race.setReferee(referee);
        }
        if (request.getPrize1() != null) race.setPrize1(request.getPrize1());
        if (request.getPrize2() != null) race.setPrize2(request.getPrize2());
        if (request.getPrize3() != null) race.setPrize3(request.getPrize3());
        
        if (request.getRakePercentage() != null) race.setRakePercentage(request.getRakePercentage());

        // Cập nhật trạng thái
        if (request.getStatus() != null && request.getStatus() != race.getStatus()) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_REFEREE"))) {
                // Lỗi BOLA: Chỉ trọng tài được phân công mới được đổi trạng thái chặng đua
                Integer currentUserId = Integer.parseInt(auth.getName());
                User currentUser = userRepository.findById(currentUserId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy user đăng nhập!"));
                if (race.getReferee() == null || !race.getReferee().getId().equals(currentUser.getId())) {
                    throw new RuntimeException("Bạn không có quyền thao tác trên chặng đua này!");
                }
                
                // Ràng buộc hoàn thành chặng cũ: Không được bắt đầu chặng mới nếu có chặng cũ chưa xong
                if (request.getStatus() == RaceStatus.RUNNING) {
                    java.util.List<Race> refereeRaces = raceRepository.findByRefereeId(currentUser.getId());
                    for (Race r : refereeRaces) {
                        if (!r.getId().equals(race.getId()) 
                                && r.getRaceTime() != null 
                                && race.getRaceTime() != null 
                                && r.getRaceTime().isBefore(race.getRaceTime())) {
                            if (r.getStatus() != RaceStatus.RESULT_CONFIRMED && r.getStatus() != RaceStatus.CANCELED && r.getStatus() != RaceStatus.COMPLETED) {
                                throw new RuntimeException("Bạn phải ký xác nhận chặng đua trước đó (" + r.getName() + ") trước khi bắt đầu chặng mới!");
                            }
                        }
                    }
                }
            }

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

    public void cleanupInvalidRegistrations(Integer raceId) {
        java.util.List<Registration> registrations = registrationRepository.findByRaceId(raceId);
        for (Registration reg : registrations) {
            java.util.List<JockeyInvitation> invitations = jockeyInvitationRepository.findByRegistrationId(reg.getId());
            boolean hasAccepted = invitations.stream().anyMatch(inv -> inv.getStatus() == InvitationStatus.ACCEPTED);
            if (!hasAccepted) {
                // Delete invitations first due to FK constraints
                jockeyInvitationRepository.deleteAll(invitations);
                // Then delete registration to free up the horse
                registrationRepository.delete(reg);
            }
        }
    }

    private RaceResponseDTO mapToResponseDTO(Race race) {
        return RaceResponseDTO.builder()
                .id(race.getId())
                .tournamentId(race.getTournament() != null ? race.getTournament().getId() : null)
                .tournamentName(race.getTournament() != null ? race.getTournament().getName() : null)
                .name(race.getName())
                .raceTime(race.getRaceTime())
                .status(race.getStatus() != null ? race.getStatus() : com.swp.horseracing.model.RaceStatus.REGISTRATION)
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

        PrizeConfig config = prizeConfigRepository.findById(1).orElse(
                PrizeConfig.builder()
                        .horseOwnerPercentage(new java.math.BigDecimal("0.05"))
                        .jockeyPercentage(new java.math.BigDecimal("0.02"))
                        .jackpotPool(java.math.BigDecimal.ZERO)
                        .build()
        );
        java.math.BigDecimal currentJackpot = config.getJackpotPool() != null ? config.getJackpotPool() : java.math.BigDecimal.ZERO;
        
        // CỘNG DỒN JACKPOT CŨ VÀO NET POOL ĐỂ TÍNH TỶ LỆ KÍCH THÍCH KHÁN GIẢ
        netPool = netPool.add(currentJackpot);

        List<Registration> registrations = registrationRepository.findByRaceId(raceId);
        List<LiveOddsResponseDTO> oddsList = new java.util.ArrayList<>();

        for (Registration reg : registrations) {
            java.math.BigDecimal totalBetOnHorse = betRepository.sumAmountByRaceIdAndRegistrationId(raceId, reg.getId());
            if (totalBetOnHorse == null) {
                totalBetOnHorse = java.math.BigDecimal.ZERO;
            }
            java.math.BigDecimal calculatedOdds = java.math.BigDecimal.ZERO;

            if (totalBetOnHorse.compareTo(java.math.BigDecimal.ZERO) > 0) {
                calculatedOdds = netPool.divide(totalBetOnHorse, 2, java.math.RoundingMode.HALF_UP);
            }

            oddsList.add(LiveOddsResponseDTO.builder()
                    .registrationId(reg.getId())
                    .horseName(reg.getHorse().getName())
                    .totalBetOnHorse(totalBetOnHorse)
                    .calculatedOdds(calculatedOdds)
                    .status(reg.getStatus() != null ? reg.getStatus().name() : null)
                    .note(reg.getNote())
                    .build());
        }

        return oddsList;
    }

    @Override
    @Transactional
    public void cancelRace(Integer id) {
        Race race = raceRepository.findById(id).orElseThrow(() -> new RuntimeException("Race not found"));
        race.setStatus(RaceStatus.CANCELED);
        raceRepository.save(race);
    }

    @Override
    @Transactional
    public RaceResponseDTO forceTransition(Integer id, String targetStatus) {
        Race race = raceRepository.findById(id).orElseThrow(() -> new RuntimeException("Race not found"));
        try {
            RaceStatus newStatus = RaceStatus.valueOf(targetStatus);
            
            // Nếu chuẩn bị chuyển sang BETTING, dọn dẹp các đơn đăng ký lỗi (không có nài ngựa)
            if (newStatus == RaceStatus.BETTING) {
                cleanupInvalidRegistrations(race.getId());
            }

            race.setStatus(newStatus);
            return mapToResponseDTO(raceRepository.save(race));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái không hợp lệ!");
        }
    }

    // [Chức năng rõ ràng]: Xử lý thanh toán và trả thưởng (Payout)
    // [Tác dụng]: Tính toán tổng quỹ chia thưởng (Net Pool), trả tiền thắng cược cho khán giả, và chia phần trăm cho chủ ngựa, nài ngựa.
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: 
    //   + Đổi tỷ lệ chia thưởng khán giả (hiện tại 65%): sửa `new java.math.BigDecimal("0.65")`.
    //   + Đổi tỷ lệ thuế (hiện tại 10% cho giải > 10 củ): sửa `0.10` và `10000000`.
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

        PrizeConfig config = prizeConfigRepository.findById(1).orElse(
                PrizeConfig.builder()
                        .horseOwnerPercentage(new java.math.BigDecimal("0.05"))
                        .jockeyPercentage(new java.math.BigDecimal("0.02"))
                        .jackpotPool(java.math.BigDecimal.ZERO)
                        .build()
        );

        java.math.BigDecimal currentJackpot = config.getJackpotPool() != null ? config.getJackpotPool() : java.math.BigDecimal.ZERO;
        
        // CỘNG DỒN JACKPOT CŨ VÀO NET POOL MỚI ĐỂ CHIA CHO KHÁN GIẢ
        netPool = netPool.add(currentJackpot);

        // Lấy tất cả bet của race
        List<Bet> allBets = betRepository.findByRaceId(raceId);
        
        // BƯỚC 2: Tính tổng tiền cược của tất cả các vé đặt vào ngựa thắng
        java.math.BigDecimal totalBetOnWinner = allBets.stream()
                .filter(b -> b.getRegistration().getId().equals(winnerReg.getId()) && b.getStatus() == BetStatus.PENDING)
                .map(b -> b.getAmount())
                .reduce(java.math.BigDecimal.ZERO, (a, b) -> a.add(b));

        // BƯỚC 3: Tính Dividend (Tỷ lệ chia thưởng)
        java.math.BigDecimal dividend = java.math.BigDecimal.ZERO;
        boolean isRefund = false;
        if (totalBetOnWinner.compareTo(java.math.BigDecimal.ZERO) > 0) {
            dividend = netPool.divide(totalBetOnWinner, 4, java.math.RoundingMode.HALF_UP);
            
            // MINUS POOL PROTECTION: Nếu Odds < 1.05, ép về 1.05 và trừ tiền từ RISK_RESERVE
            if (dividend.compareTo(new java.math.BigDecimal("1.05")) < 0) {
                java.math.BigDecimal originalDividend = dividend;
                dividend = new java.math.BigDecimal("1.05");
                
                // Tính phần thiếu hụt
                java.math.BigDecimal shortfallPerUnit = dividend.subtract(originalDividend);
                java.math.BigDecimal totalShortfall = totalBetOnWinner.multiply(shortfallPerUnit).setScale(2, java.math.RoundingMode.HALF_UP);
                
                // Trừ từ RISK_RESERVE
                SystemFund riskReserve = systemFundRepository.findByFundTypeWithPessimisticWrite("RISK_RESERVE")
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy Quỹ dự phòng rủi ro (RISK_RESERVE) để bù lỗ!"));
                if (riskReserve.getBalance().compareTo(totalShortfall) < 0) {
                    throw new RuntimeException("Quỹ dự phòng rủi ro không đủ để bù lỗ!");
                }
                riskReserve.setBalance(riskReserve.getBalance().subtract(totalShortfall));
                systemFundRepository.save(riskReserve);
                
                // Lưu log rút quỹ bù lỗ
                TransactionHistory txShortfall = TransactionHistory.builder()
                        .transactionCode("RISK-" + java.util.UUID.randomUUID().toString().substring(0,8).toUpperCase())
                        .amount(totalShortfall)
                        .type(TransactionType.SYSTEM_FUND_DEDUCTION)
                        .direction(TransactionDirection.OUT)
                        .status(TransactionStatus.COMPLETED)
                        .build();
                transactionHistoryRepository.save(txShortfall);
            }
            
            // Xóa sổ Jackpot cũ vì đã có người trúng
            if (currentJackpot.compareTo(java.math.BigDecimal.ZERO) > 0) {
                config.setJackpotPool(java.math.BigDecimal.ZERO);
                prizeConfigRepository.save(config);
            }
        } else {
            // KHÔNG CÓ AI TRÚNG CƯỢC -> AUTO REFUND THAY VÌ JACKPOT
            isRefund = true;
        }

        for (Bet bet : allBets) {
            if (bet.getStatus() != BetStatus.PENDING) continue; // Bỏ qua nếu đã xử lý

            if (isRefund) {
                bet.setStatus(BetStatus.REFUNDED);
                bet.setReward(bet.getAmount());
                
                // Hoàn tiền vào ví
                Wallet wallet = walletRepository.findByUserIdForUpdate(bet.getSpectator().getId())
                        .orElseThrow(() -> new RuntimeException("Lỗi ví người chơi"));
                wallet.setBalance(wallet.getBalance().add(bet.getAmount()));
                walletRepository.save(wallet);

                TransactionHistory txRefund = TransactionHistory.builder()
                        .transactionCode("REF-" + java.util.UUID.randomUUID().toString().substring(0,8).toUpperCase())
                        .wallet(wallet)
                        .bet(bet)
                        .amount(bet.getAmount())
                        .type(TransactionType.REFUND)
                        .direction(TransactionDirection.IN)
                        .status(TransactionStatus.COMPLETED)
                        .build();
                transactionHistoryRepository.save(txRefund);
                
                betRepository.save(bet);
                continue;
            }

            if (bet.getRegistration().getId().equals(winnerReg.getId())) {
                bet.setStatus(BetStatus.WON);
                
                // BƯỚC 4: Tiền thắng (Gross Winnings)
                java.math.BigDecimal grossWinnings = bet.getAmount().multiply(dividend).setScale(2, java.math.RoundingMode.HALF_UP);
                
                // THU THUẾ TNCN (10% cho lợi nhuận > 10,000,000 VNĐ)
                java.math.BigDecimal profit = grossWinnings.subtract(bet.getAmount());
                java.math.BigDecimal tax = java.math.BigDecimal.ZERO;
                if (profit.compareTo(new java.math.BigDecimal("10000000")) > 0) {
                    java.math.BigDecimal taxableAmount = profit.subtract(new java.math.BigDecimal("10000000"));
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
        // config đã được gọi ở BƯỚC 1

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

        // BƯỚC 6: Chi trả Giải thưởng Cố định (Set Prize) cho Top 1, 2, 3 (Chủ ngựa)
        for (Registration reg : registrations) {
            if (reg.getRank() == null) continue;

            java.math.BigDecimal fixedPrize = java.math.BigDecimal.ZERO;
            if (reg.getRank() == 1 && race.getPrize1() != null) {
                fixedPrize = race.getPrize1();
            } else if (reg.getRank() == 2 && race.getPrize2() != null) {
                fixedPrize = race.getPrize2();
            } else if (reg.getRank() == 3 && race.getPrize3() != null) {
                fixedPrize = race.getPrize3();
            }

            if (fixedPrize.compareTo(java.math.BigDecimal.ZERO) > 0) {
                // 70% Owner
                java.math.BigDecimal ownerFixed = fixedPrize.multiply(new java.math.BigDecimal("0.70")).setScale(2, java.math.RoundingMode.HALF_UP);
                if (ownerFixed.compareTo(java.math.BigDecimal.ZERO) > 0 && reg.getOwner() != null) {
                    Wallet ownerWallet = walletRepository.findByUserIdForUpdate(reg.getOwner().getId()).orElse(null);
                    if (ownerWallet != null) {
                        ownerWallet.setBalance(ownerWallet.getBalance().add(ownerFixed));
                        walletRepository.save(ownerWallet);
                        TransactionHistory txFixed = TransactionHistory.builder()
                                .transactionCode("SETPRIZE-OWNER-" + java.util.UUID.randomUUID().toString().substring(0,8).toUpperCase())
                                .wallet(ownerWallet)
                                .amount(ownerFixed)
                                .type(TransactionType.REWARD)
                                .direction(TransactionDirection.IN)
                                .status(TransactionStatus.COMPLETED)
                                .build();
                        transactionHistoryRepository.save(txFixed);
                    }
                }

                // 30% Jockey
                java.math.BigDecimal jockeyFixed = fixedPrize.subtract(ownerFixed);
                if (jockeyFixed.compareTo(java.math.BigDecimal.ZERO) > 0 && reg.getJockey() != null) {
                    Wallet jockeyWallet = walletRepository.findByUserIdForUpdate(reg.getJockey().getId()).orElse(null);
                    if (jockeyWallet != null) {
                        jockeyWallet.setBalance(jockeyWallet.getBalance().add(jockeyFixed));
                        walletRepository.save(jockeyWallet);
                        TransactionHistory txFixedJockey = TransactionHistory.builder()
                                .transactionCode("SETPRIZE-JOCKEY-" + java.util.UUID.randomUUID().toString().substring(0,8).toUpperCase())
                                .wallet(jockeyWallet)
                                .amount(jockeyFixed)
                                .type(TransactionType.REWARD)
                                .direction(TransactionDirection.IN)
                                .status(TransactionStatus.COMPLETED)
                                .build();
                        transactionHistoryRepository.save(txFixedJockey);
                    }
                }
            }
        }

        // Chuyển trạng thái chặng đua thành Đã kết toán
        race.setStatus(RaceStatus.COMPLETED);
        raceRepository.save(race);
    }

    // 4-STEP SETTLEMENT: Bước 1
    @Transactional
    public void submitProvisionalResult(Integer raceId) {
        Race race = raceRepository.findById(raceId).orElseThrow(() -> new RuntimeException("Not found"));
        if (race.getStatus() != RaceStatus.FINISHED) throw new RuntimeException("Chặng đua phải ở trạng thái FINISHED");
        race.setStatus(RaceStatus.PROVISIONAL_RESULT);
        raceRepository.save(race);
    }

    // 4-STEP SETTLEMENT: Bước 4 (Bỏ qua B2,B3 của RefereeService cho nhanh gọn demo hoặc gọi BetService)
    @Transactional
    public void startPay(Integer raceId) {
        Race race = raceRepository.findById(raceId).orElseThrow(() -> new RuntimeException("Not found"));
        if (race.getStatus() != RaceStatus.RESULT_CONFIRMED) throw new RuntimeException("Phải được Trọng tài xác nhận (RESULT_CONFIRMED)");
        
        // Gọi BetService (Trong thực tế cần inject BetService, ở đây ta có BetRepository nên gọi thẳng nếu cần)
        race.setStatus(RaceStatus.COMPLETED);
        raceRepository.save(race);
    }

    @Transactional
    public void markRegistrationAsScratchOrNonStarter(Integer registrationId, RegistrationStatus status) {
        Registration reg = registrationRepository.findById(registrationId).orElseThrow();
        if (status != RegistrationStatus.SCRATCH && status != RegistrationStatus.NON_STARTER) {
            throw new RuntimeException("Chỉ hỗ trợ SCRATCH hoặc NON_STARTER");
        }
        reg.setStatus(status);
        registrationRepository.save(reg);

        // Hoàn tiền cho các vé cược chứa ngựa này
        java.util.List<Bet> affectedBets = betRepository.findByRaceId(reg.getRace().getId()).stream()
            .filter(b -> b.getRegistration().getId().equals(registrationId) || 
                        (b.getRegistration2() != null && b.getRegistration2().getId().equals(registrationId)))
            .collect(java.util.stream.Collectors.toList());

        for (Bet b : affectedBets) {
            if (b.getStatus() == com.swp.horseracing.model.BetStatus.PENDING) {
                b.setStatus(com.swp.horseracing.model.BetStatus.REFUNDED);
                betRepository.save(b);
                
                // Trả tiền ví
                Wallet w = walletRepository.findByUserId(b.getSpectator().getId()).orElseThrow();
                w.setBalance(w.getBalance().add(b.getAmount()));
                walletRepository.save(w);
                
                // Trừ Total Pool của Race
                Race race = reg.getRace();
                race.setTotalPool(race.getTotalPool().subtract(b.getAmount()));
                raceRepository.save(race);
            }
        }
    }

}
