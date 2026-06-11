package com.swp.horseracing.service.impl;

import com.swp.horseracing.model.Wallet;
import com.swp.horseracing.model.TransactionHistory;
import com.swp.horseracing.model.TransactionType;
import com.swp.horseracing.model.TransactionDirection;
import com.swp.horseracing.repository.WalletRepository;
import com.swp.horseracing.repository.TransactionHistoryRepository;
import com.swp.horseracing.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final TransactionHistoryRepository transactionRepository;

    @Override
    public Wallet getWalletByUserId(Integer userId) {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví của người dùng này!"));
    }

    @Override
    @Transactional
    public Wallet depositMoney(Integer userId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền nạp phải lớn hơn 0!");
        }

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví của người dùng này!"));

        // 1. Cộng tiền vào ví
        wallet.setBalance(wallet.getBalance().add(amount));
        Wallet savedWallet = walletRepository.save(wallet);

        // 2. Lưu vào lịch sử giao dịch (Chiều IN, Loại DEPOSIT)
        // Trong WalletServiceImpl.java (Hàm nạp tiền)
        TransactionHistory history = TransactionHistory.builder()
                .transactionCode("DEP-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase()) // <-- Bổ sung cho hàm nạp tiền
                .wallet(savedWallet)
                .amount(amount)
                .type(TransactionType.DEPOSIT)
                .direction(TransactionDirection.IN)
                .build();
        transactionRepository.save(history);
        return savedWallet;
    }

    @Override
    @Transactional
    public String requestWithdrawal(Integer userId, BigDecimal amount) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví của người dùng này!"));

        // 1. Kiểm tra đầu vào
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền rút phải lớn hơn 0!");
        }

        // 2. Kiểm tra số dư có đủ để rút không
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Số dư trong ví không đủ để thực hiện lệnh rút!");
        }

        // 3. Thực hiện TRỪ TIỀN thay vì ép về 0
        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        // 4. Sinh mã lệnh rút & Ghi vào lịch sử giao dịch (PENDING)
        String transCode = "WDR-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        TransactionHistory history = TransactionHistory.builder()
                .transactionCode(transCode)
                .wallet(wallet)
                .amount(amount)
                .type(TransactionType.WITHDRAW)
                .direction(TransactionDirection.OUT)
                .status(com.swp.horseracing.model.TransactionStatus.PENDING)
                .build();
        transactionRepository.save(history);

        // 5. Trả về đúng mã giao dịch này để Frontend hứng lấy
        return transCode;
    }
}