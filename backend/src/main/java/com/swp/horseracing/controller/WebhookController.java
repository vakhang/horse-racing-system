package com.swp.horseracing.controller;

import com.swp.horseracing.dto.SePayWebhookRequestDTO;
import com.swp.horseracing.model.TransactionDirection;
import com.swp.horseracing.model.TransactionHistory;
import com.swp.horseracing.model.TransactionStatus;
import com.swp.horseracing.model.TransactionType;
import com.swp.horseracing.model.Wallet;
import com.swp.horseracing.repository.TransactionHistoryRepository;
import com.swp.horseracing.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/webhook")
@RequiredArgsConstructor
public class WebhookController {

    private final WalletRepository walletRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;

    @PostMapping("/sepay")
    public ResponseEntity<?> handleSePayWebhook(@RequestBody SePayWebhookRequestDTO request) {
        try {
            // Chỉ xử lý giao dịch nhận tiền (in)
            if (!"in".equalsIgnoreCase(request.getTransferType())) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Bỏ qua: Không phải giao dịch nhận tiền"));
            }

            String content = request.getTransactionContent() != null ? request.getTransactionContent().toUpperCase() : "";

            // Trích xuất userId từ cú pháp "NAP + userId"
            Pattern pattern = Pattern.compile("NAP(\\d+)");
            Matcher matcher = pattern.matcher(content);

            if (matcher.find()) {
                Integer userId = Integer.parseInt(matcher.group(1));

                // Tìm ví của User
                Wallet wallet = walletRepository.findByUserId(userId).orElse(null);

                if (wallet != null) {
                    // Cộng tiền vào ví
                    wallet.setBalance(wallet.getBalance().add(request.getTransferAmount()));
                    walletRepository.save(wallet);

                    // Ghi lại lịch sử giao dịch bằng referenceCode của SePay
                    TransactionHistory tx = new TransactionHistory();
                    tx.setTransactionCode(request.getReferenceCode());
                    tx.setWallet(wallet);
                    tx.setAmount(request.getTransferAmount());
                    tx.setType(TransactionType.DEPOSIT);
                    tx.setDirection(TransactionDirection.IN);
                    tx.setStatus(TransactionStatus.COMPLETED);
                    tx.setProofUrl("Auto-Deposit via SePay Webhook");

                    transactionHistoryRepository.save(tx);
                }
            }

            // Trả về chuẩn JSON để SePay ghi nhận thành công, ngừng spam request
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            System.err.println("Webhook SePay Error: " + e.getMessage());
            return ResponseEntity.ok(Map.of("success", false, "message", e.getMessage()));
        }
    }
}