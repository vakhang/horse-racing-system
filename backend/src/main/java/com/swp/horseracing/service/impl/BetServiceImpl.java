package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.BetRequestDTO;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.*;
import com.swp.horseracing.service.BetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chặng đua!"));
        Registration reg = registrationRepository.findById(request.getRegistrationId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đăng ký ngựa!"));

        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Tài khoản chưa khởi tạo ví!"));

        // LOGIC THEO SẾP DẶN:
        // 1. Check Ví xem đủ tiền không -> Đủ thì trừ tiền.
        if (wallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Số dư tài khoản không đủ để đặt cược!");
        }
        wallet.setBalance(wallet.getBalance().subtract(request.getAmount()));
        walletRepository.save(wallet);

        // 2. Lưu Phiếu cược Bet (Cột odds để trống null).
        Bet bet = Bet.builder()
                .user(user)
                .race(race)
                .registration(reg)
                .amount(request.getAmount())
                .odds(null) // Để null theo đúng yêu cầu logic gắt
                .build();
        Bet savedBet = betRepository.save(bet);

        // 3. Lưu Lịch sử giao dịch (Type BET, Chiều OUT).
        TransactionHistory history = TransactionHistory.builder()
                .transactionCode("BET-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase()) // <-- THÊM DÒNG NÀY ĐỂ FIX LỖI
                .wallet(wallet)
                .amount(request.getAmount())
                .type(TransactionType.BET)
                .direction(TransactionDirection.OUT)
                .build();

        transactionRepository.save(history);

        // 4. Cộng cái amount đó vào thẳng total_pool của bảng Race.
        race.setTotalPool(race.getTotalPool().add(request.getAmount()));
        raceRepository.save(race);

        return savedBet;
    }
}