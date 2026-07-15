package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.RefereeReportRequestDTO;
import com.swp.horseracing.dto.RefereeResultRequestDTO;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.*;
import com.swp.horseracing.service.RefereeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefereeServiceImpl implements RefereeService {

    private final RaceRepository raceRepository;
    private final BetRepository betRepository;
    private final WalletRepository walletRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final RefereeReportRepository refereeReportRepository;
    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;
    private final HorseRepository horseRepository;

    @Override
    @Transactional
    public String submitRaceResult(RefereeResultRequestDTO request) {
        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Chặng đua!"));

        if (race.getStatus() == RaceStatus.FINISHED) {
            throw new RuntimeException("Chặng đua này đã được chốt kết quả!");
        }
        race.setStatus(RaceStatus.FINISHED);
        raceRepository.save(race);

        Registration winningReg = registrationRepository.findById(request.getTop1RegistrationId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký chiến thắng!"));

        // 1. Cập nhật chỉ số cho TẤT CẢ các con ngựa tham gia
        List<Registration> allRegs = registrationRepository.findByRaceId(race.getId());
        for (Registration reg : allRegs) {
            Horse h = reg.getHorse();
            h.setTotalRaces((h.getTotalRaces() != null ? h.getTotalRaces() : 0) + 1);
            if (reg.getId().equals(winningReg.getId())) {
                h.setWinRaces((h.getWinRaces() != null ? h.getWinRaces() : 0) + 1);
            }
            horseRepository.save(h);
        }

        // 2. Tính toán Dòng tiền (GGR & Phế Admin)
        BigDecimal totalPool = race.getTotalPool() != null ? race.getTotalPool() : BigDecimal.ZERO;
        BigDecimal adminRake = totalPool.multiply(race.getRakePercentage()).divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);

        // Trả phế cho Admin (Doanh thu thực tế - NGR)
        User adminUser = userRepository.findAll().stream().filter(u -> u.getRole() == RoleEnum.ADMIN).findFirst().orElse(null);
        if (adminUser != null) {
            Wallet adminWallet = walletRepository.findByUserId(adminUser.getId()).orElse(null);
            if (adminWallet != null && adminRake.compareTo(BigDecimal.ZERO) > 0) {
                adminWallet.setBalance(adminWallet.getBalance().add(adminRake));
                walletRepository.save(adminWallet);
                saveTx(adminWallet, adminRake, TransactionType.REWARD, TransactionDirection.IN);
            }
        }

        // Chia thưởng cho Chủ ngựa (5%) và Nài ngựa (2%) từ tổng Pool
        BigDecimal ownerBonus = totalPool.multiply(new BigDecimal("0.05"));
        Wallet ownerWallet = walletRepository.findByUserId(winningReg.getOwner().getId()).orElse(null);
        if (ownerWallet != null && ownerBonus.compareTo(BigDecimal.ZERO) > 0) {
            ownerWallet.setBalance(ownerWallet.getBalance().add(ownerBonus));
            walletRepository.save(ownerWallet);
            saveTx(ownerWallet, ownerBonus, TransactionType.REWARD, TransactionDirection.IN);
        }

        if (winningReg.getJockey() != null) {
            BigDecimal jockeyBonus = totalPool.multiply(new BigDecimal("0.02"));
            Wallet jockeyWallet = walletRepository.findByUserId(winningReg.getJockey().getId()).orElse(null);
            if (jockeyWallet != null && jockeyBonus.compareTo(BigDecimal.ZERO) > 0) {
                jockeyWallet.setBalance(jockeyWallet.getBalance().add(jockeyBonus));
                walletRepository.save(jockeyWallet);
                saveTx(jockeyWallet, jockeyBonus, TransactionType.REWARD, TransactionDirection.IN);
            }
        }

        // 3. Trả tiền cho Khán giả cược trúng
        List<Bet> bets = betRepository.findByRaceId(race.getId());
        for (Bet bet : bets) {
            if (bet.getRegistration().getId().equals(request.getTop1RegistrationId())) {
                bet.setStatus(BetStatus.WON);

                // TUYỆT ĐỐI DÙNG ODDS CỐ ĐỊNH ĐÃ LƯU TRONG VÉ (Fixed-Odds)
                BigDecimal odds = bet.getOdds() != null ? bet.getOdds() : BigDecimal.ONE;
                // CÔNG THỨC MỚI: Tiền Thưởng = Vốn * Tỷ Lệ Cược (Fixed Odds)
                BigDecimal rewardAmount = bet.getAmount().multiply(odds).setScale(0, java.math.RoundingMode.HALF_UP);

                bet.setReward(rewardAmount);

                Wallet w = walletRepository.findByUserId(bet.getSpectator().getId()).orElseThrow();
                w.setBalance(w.getBalance().add(rewardAmount));
                walletRepository.save(w);
                saveTx(w, rewardAmount, TransactionType.REWARD, TransactionDirection.IN);
            } else {
                bet.setStatus(BetStatus.LOST);
            }
            betRepository.save(bet);
        }

        return "Chốt kết quả thành công! Đã tự động chia tiền cho người thắng, Chủ ngựa, Nài ngựa và thu phế sàn.";
    }

    private void saveTx(Wallet wallet, BigDecimal amount, TransactionType type, TransactionDirection dir) {
        TransactionHistory tx = TransactionHistory.builder()
                .transactionCode("PAYOUT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .wallet(wallet)
                .amount(amount)
                .type(type)
                .direction(dir)
                .status(TransactionStatus.COMPLETED)
                .build();
        transactionHistoryRepository.save(tx);
    }

    @Override
    public String submitReport(RefereeReportRequestDTO request) {
        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Race not found"));
        User referee = userRepository.findById(request.getRefereeId())
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        Registration registration = registrationRepository.findById(request.getRegistrationId())
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        RefereeReport report = RefereeReport.builder()
                .race(race)
                .referee(referee)
                .registration(registration)
                .violationDetails(request.getViolationDetails())
                .build();

        refereeReportRepository.save(report);

        return "Lập biên bản vi phạm thành công!";
    }
}