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
        if (race.getStatus() != RaceStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể đặt cược vào chặng đua chưa bắt đầu!");
        }

        Registration reg = registrationRepository.findById(request.getRegistrationId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngựa đăng ký!"));

        Wallet wallet = walletRepository.findByUserId(spectator.getId())
                .orElseThrow(() -> new RuntimeException("Tài khoản chưa có ví!"));

        if (wallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Số dư không đủ để đặt cược!");
        }

        // CHỐT KÈO (FIXED-ODDS): Lấy odds cố định từ Registration
        java.math.BigDecimal fixedOdds = reg.getOdds() != null ? reg.getOdds() : java.math.BigDecimal.ONE;

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
                .odds(fixedOdds) // KHÓA ODDS Ở ĐÂY, VĨNH VIỄN KHÔNG ĐỔI
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