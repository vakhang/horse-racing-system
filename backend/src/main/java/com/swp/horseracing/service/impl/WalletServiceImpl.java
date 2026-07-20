package com.swp.horseracing.service.impl;

import com.swp.horseracing.model.User;
import com.swp.horseracing.model.Wallet;
import com.swp.horseracing.model.TransactionHistory;
import com.swp.horseracing.model.TransactionType;
import com.swp.horseracing.model.TransactionDirection;
import com.swp.horseracing.repository.UserRepository;
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
    private final UserRepository userRepository;

    @Override
    public Wallet getWalletByUserId(Integer userId) {
        // FIX LỖI POPUP: Tự động tạo ví nếu tài khoản cũ chưa có
        return walletRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId).orElseThrow();
            Wallet newWallet = Wallet.builder().user(user).balance(BigDecimal.ZERO).build();
            return walletRepository.save(newWallet);
        });
    }

    @Override
    @Transactional
    public Wallet depositMoney(Integer userId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền nạp phải lớn hơn 0!");
        }

        Wallet wallet = getWalletByUserId(userId);

        wallet.setBalance(wallet.getBalance().add(amount));
        Wallet savedWallet = walletRepository.save(wallet);

        TransactionHistory history = TransactionHistory.builder()
                .transactionCode("DEP-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
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
    public String requestWithdrawal(Integer userId, BigDecimal amount, String bankName, String accNumber, String accName) {
        Wallet wallet = getWalletByUserId(userId);

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền rút phải lớn hơn 0!");
        }

        if (amount.compareTo(new BigDecimal("100000")) < 0) {
            throw new RuntimeException("Số tiền rút tối thiểu là 100,000 VNĐ!");
        }

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Số dư trong ví không đủ để thực hiện lệnh rút!");
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        String transCode = "WDR-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        TransactionHistory history = TransactionHistory.builder()
                .transactionCode(transCode)
                .wallet(wallet)
                .amount(amount)
                .type(TransactionType.WITHDRAW)
                .direction(TransactionDirection.OUT)
                .status(com.swp.horseracing.model.TransactionStatus.PENDING)
                .bankName(bankName)
                .accountNumber(accNumber)
                .accountName(accName)
                .build();
        transactionRepository.save(history);

        return transCode;
    }
}