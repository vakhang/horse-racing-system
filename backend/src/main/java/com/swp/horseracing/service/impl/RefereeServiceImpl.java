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
    @Override
    @Transactional
    public String submitRaceResult(RefereeResultRequestDTO request) {
        // 1. Tìm Race và khóa (chuyển sang FINISHED)
        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if (race.getStatus() == RaceStatus.FINISHED) {
            throw new RuntimeException("Chặng đua này đã có kết quả!");
        }
        race.setStatus(RaceStatus.FINISHED);
        raceRepository.save(race);

        // 2. Lấy tất cả vé cược của chặng này
        List<Bet> bets = betRepository.findByRaceId(race.getId());

        for (Bet bet : bets) {
            // So sánh ID ngựa (registrationId) với kết quả Top 1
            if (bet.getRegistration().getId().equals(request.getTop1RegistrationId())) {
                // Trúng thưởng
                bet.setStatus(BetStatus.WON);
                betRepository.save(bet);

                // 3. Trả thưởng
                Wallet wallet = walletRepository.findByUserId(bet.getSpectator().getId())
                        .orElseThrow(() -> new RuntimeException("Wallet not found for user " + bet.getSpectator().getId()));
                
                // Tính tiền = Tiền cược * Tỉ lệ cược
                BigDecimal odds = bet.getOdds() != null ? bet.getOdds() : BigDecimal.ONE;
                BigDecimal rewardAmount = bet.getAmount().multiply(odds);
                
                wallet.setBalance(wallet.getBalance().add(rewardAmount));
                walletRepository.save(wallet);

                // 4. Ghi lịch sử giao dịch (Transaction)
                TransactionHistory tx = TransactionHistory.builder()
                        .transactionCode("REWARD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                        .wallet(wallet)
                        .amount(rewardAmount)
                        .type(TransactionType.REWARD)// Dùng PAYOUT thay cho REWARD
                        .direction(TransactionDirection.IN)
                        .build();
                transactionHistoryRepository.save(tx);
            } else {
                // Trượt
                bet.setStatus(BetStatus.LOST);
                betRepository.save(bet);
            }
        }

        return "Chốt kết quả thành công! Đã trả thưởng cho người chiến thắng.";
    }

    @Override
    public String submitReport(RefereeReportRequestDTO request) {
        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Race not found"));
        User referee = userRepository.findById(request.getRefereeId())
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        // 1. Phạt theo Registration thay vì Violator
        Registration registration = registrationRepository.findById(request.getRegistrationId())
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        // 2. Build report với các trường đã cập nhật theo DB
        RefereeReport report = RefereeReport.builder()
                .race(race)
                .referee(referee)
                .registration(registration) // Đổi .violator thành .registration
                .violationDetails(request.getViolationDetails()) // Đổi .description thành .violationDetails
                .build();

        refereeReportRepository.save(report);

        return "Lập biên bản vi phạm thành công!";
    }
}
