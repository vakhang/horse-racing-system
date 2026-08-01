package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.BetRequestDTO;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.*;
import com.swp.horseracing.service.BetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BetServiceImpl implements BetService {
    private final BetRepository betRepository;
    private final UserRepository userRepository;
    private final RaceRepository raceRepository;
    private final RegistrationRepository registrationRepository;
    private final WalletRepository walletRepository;
    private final TransactionHistoryRepository transactionRepository;

    @Override
    @Transactional
    public Bet createBet(BetRequestDTO request) {
        User spectator = userRepository.findById(request.getSpectatorId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Khán giả!"));

        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chặng đua!"));

        // RÀO CẢN: Chỉ được cược khi chặng đua chưa bắt đầu (PENDING)
        if (race.getStatus() != RaceStatus.BETTING) {
            throw new RuntimeException("Chặng đua hiện không trong trạng thái nhận cược!");
        }

        // RÀO CẢN 1: Khóa cược 1 phút trước giờ xuất phát và chỉ mở trước 12 giờ
        if (race.getRaceTime() != null) {
            java.time.LocalDateTime now = java.time.LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));
            if (now.plusMinutes(1).isAfter(race.getRaceTime())) {
                throw new RuntimeException("Hệ thống đã khóa nhận cược cho chặng đua này!");
            }
            if (now.plusHours(12).isBefore(race.getRaceTime())) {
                throw new RuntimeException("Cổng cược chỉ mở 12 giờ trước khi cuộc đua bắt đầu!");
            }
        }

        // RÀO CẢN 2: Giới hạn số tiền cược
        if (request.getAmount().compareTo(new BigDecimal("10000")) < 0) {
            throw new RuntimeException("Số tiền cược tối thiểu là 10,000 VNĐ!");
        }

        java.time.LocalDateTime startOfDay = java.time.LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")).with(java.time.LocalTime.MIN);
        java.time.LocalDateTime endOfDay = java.time.LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")).with(java.time.LocalTime.MAX);
        BigDecimal dailyTotal = betRepository.sumDailyBetAmountBySpectatorId(spectator.getId(), startOfDay, endOfDay);
        if (dailyTotal == null) {
            dailyTotal = BigDecimal.ZERO;
        }
        
        if (dailyTotal.add(request.getAmount()).compareTo(new BigDecimal("1000000")) > 0) {
            throw new RuntimeException("Bạn đã vượt quá hạn mức cược tối đa 1,000,000 VNĐ/ngày!");
        }

        Registration reg = registrationRepository.findById(request.getRegistrationId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngựa đăng ký!"));

        Wallet wallet = walletRepository.findByUserId(spectator.getId())
                .orElseThrow(() -> new RuntimeException("Tài khoản chưa có ví!"));

        if (wallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Số dư không đủ để đặt cược!");
        }

        // TÍNH LIVE ODDS (Pari-Mutuel) TẠI THỜI ĐIỂM CƯỢC
        BigDecimal currentTotalPool = race.getTotalPool() != null ? race.getTotalPool() : BigDecimal.ZERO;
        BigDecimal newTotalPool = currentTotalPool.add(request.getAmount());

        BigDecimal rakePercentage = race.getRakePercentage() != null ? race.getRakePercentage() : new BigDecimal("20.00");
        BigDecimal netPool = newTotalPool.multiply(
                BigDecimal.valueOf(100).subtract(rakePercentage)
        ).divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP);

        BigDecimal totalBetOnHorse = betRepository.sumAmountByRaceIdAndRegistrationId(race.getId(), reg.getId());
        if (totalBetOnHorse == null) totalBetOnHorse = BigDecimal.ZERO;
        BigDecimal newTotalBetOnHorse = totalBetOnHorse.add(request.getAmount());

        BigDecimal expectedOdds = BigDecimal.ONE; // Mặc định 1.0 nếu có lỗi
        if (newTotalBetOnHorse.compareTo(BigDecimal.ZERO) > 0) {
            expectedOdds = netPool.divide(newTotalBetOnHorse, 2, java.math.RoundingMode.HALF_UP);
        }

        // Trừ tiền ví
        wallet.setBalance(wallet.getBalance().subtract(request.getAmount()));
        walletRepository.save(wallet);

        // Lưu vé cược
        Bet bet = Bet.builder()
                .spectator(spectator)
                .race(race)
                .registration(reg)
                .amount(request.getAmount())
                .status(BetStatus.PENDING)
                .expectedOdds(expectedOdds) // Tỷ lệ tạm tính Pari-Mutuel
                .build();
        Bet savedBet = betRepository.save(bet);

        // Ghi lịch sử trừ tiền
        TransactionHistory history = TransactionHistory.builder()
                .transactionCode("BET-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .wallet(wallet)
                .amount(request.getAmount())
                .type(TransactionType.BET)
                .direction(TransactionDirection.OUT)
                .bet(savedBet)
                .status(TransactionStatus.COMPLETED)
                .build();
        transactionRepository.save(history);

        // Cộng vào tổng pool
        BigDecimal currentPool = race.getTotalPool() != null ? race.getTotalPool() : BigDecimal.ZERO;
        race.setTotalPool(currentPool.add(request.getAmount()));
        raceRepository.save(race);

        return savedBet;
    }
}