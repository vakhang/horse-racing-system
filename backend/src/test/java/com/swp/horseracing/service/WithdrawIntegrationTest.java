package com.swp.horseracing.service;

import com.swp.horseracing.dto.CompleteWithdrawalRequestDTO;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class WithdrawIntegrationTest {

    @Autowired private WalletService walletService;
    @Autowired private AdminTransactionService adminTransactionService;
    
    @Autowired private UserRepository userRepository;
    @Autowired private WalletRepository walletRepository;
    @Autowired private TransactionHistoryRepository transactionHistoryRepository;

    @Test
    public void testWithdrawalFlow_HappyPath() {
        System.out.println("\n=============================================");
        System.out.println("[LOG BÁO CÁO RÚT TIỀN] BẮT ĐẦU CHẠY KỊCH BẢN");
        System.out.println("=============================================\n");

        // 1. SETUP DỮ LIỆU ẢO
        System.out.println("[LOG BÁO CÁO] 1. Khởi tạo người chơi và ví...");
        User player = userRepository.save(User.builder()
                .username("nguoichoiruttien")
                .password("123456")
                .email("rut@gmail.com")
                .role(RoleEnum.SPECTATOR)
                .build());

        Wallet wallet = walletRepository.save(Wallet.builder()
                .user(player)
                .balance(new BigDecimal("500000")) // Có 500k
                .build());

        System.out.println("[LOG BÁO CÁO] + Số dư ví hiện tại: " + wallet.getBalance() + " VNĐ");

        // 2. KHÁN GIẢ GỌI API RÚT TIỀN
        System.out.println("\n[LOG BÁO CÁO] 2. Khán giả bấm nút Rút toàn bộ tiền...");
        String msg1 = walletService.requestWithdrawal(player.getId());
        System.out.println("[LOG BÁO CÁO] + Kết quả: " + msg1);

        Wallet updatedWallet = walletRepository.findById(wallet.getId()).get();
        assertEquals(0, BigDecimal.ZERO.compareTo(updatedWallet.getBalance()));
        System.out.println("[LOG BÁO CÁO] + Ví sau khi tạo lệnh: " + updatedWallet.getBalance() + " VNĐ (Đã ép về 0)");

        // Lấy mã giao dịch vừa tạo
        List<TransactionHistory> txs = transactionHistoryRepository.findAll();
        TransactionHistory pendingTx = txs.get(txs.size() - 1);
        assertEquals(TransactionStatus.PENDING, pendingTx.getStatus());
        System.out.println("[LOG BÁO CÁO] + Sinh lệnh rút: " + pendingTx.getTransactionCode() + " | " + pendingTx.getAmount() + " | Trạng thái: " + pendingTx.getStatus());

        // 3. ADMIN KẾ TOÁN GỌI API XÁC NHẬN
        System.out.println("\n[LOG BÁO CÁO] 3. Kế toán chuyển khoản 500k ở ngoài đời và up link bill lên hệ thống...");
        CompleteWithdrawalRequestDTO adminReq = new CompleteWithdrawalRequestDTO();
        adminReq.setProofUrl("https://imgur.com/bill-chuyen-khoan-500k.png");
        
        String msg2 = adminTransactionService.completeWithdrawal(pendingTx.getId(), adminReq);
        System.out.println("[LOG BÁO CÁO] + Kết quả: " + msg2);

        TransactionHistory completedTx = transactionHistoryRepository.findById(pendingTx.getId()).get();
        assertEquals(TransactionStatus.COMPLETED, completedTx.getStatus());
        assertEquals("https://imgur.com/bill-chuyen-khoan-500k.png", completedTx.getProofUrl());
        
        System.out.println("[LOG BÁO CÁO] + Trạng thái lệnh rút hiện tại: " + completedTx.getStatus());
        System.out.println("[LOG BÁO CÁO] + Link minh chứng đính kèm: " + completedTx.getProofUrl());

        System.out.println("\n=============================================");
        System.out.println("✅ [LOG BÁO CÁO] KỊCH BẢN RÚT TIỀN HOÀN HẢO! LƯU HÌNH NHÉ BẠN ƠI.");
        System.out.println("=============================================\n");
    }
}
