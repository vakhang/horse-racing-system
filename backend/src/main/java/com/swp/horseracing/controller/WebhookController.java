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

import java.math.BigDecimal;
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
            System.out.println(">>> SEPAY GỌI TỚI! NỘI DUNG CK: " + request.getContent());

            if (!"in".equalsIgnoreCase(request.getTransferType())) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Bỏ qua: Không phải giao dịch nhận tiền"));
            }

            // SePay lưu nội dung chuyển khoản trong trường 'content', ta lấy và chuẩn hóa nó
            String content = request.getContent() != null ? request.getContent().toUpperCase().trim() : "";

            // REGEX MỚI: Tìm chữ NAP, theo sau là các chữ số (đây chính là UserId)
            Pattern pattern = Pattern.compile("NAP(\\d+)");
            Matcher matcher = pattern.matcher(content);

            if (matcher.find()) {
                // Trích xuất UserId từ nội dung
                Integer userId = Integer.parseInt(matcher.group(1));

                // Lấy toàn bộ mã giao dịch gốc do chúng ta sinh ra (bao gồm cả NAP, UserId và chuỗi ngẫu nhiên)
                String fullTransactionCode = content.substring(matcher.start()).split("\\s+")[0];

                Wallet wallet = walletRepository.findByUserId(userId).orElse(null);

                if (wallet != null) {
                    // 🎯 ĐIỂM FIX LỖI: Ép kiểu dữ liệu Long từ SePay sang BigDecimal của hệ thống
                    BigDecimal transferAmount = BigDecimal.valueOf(request.getTransferAmount());

                    // Cộng tiền vào ví bằng BigDecimal
                    wallet.setBalance(wallet.getBalance().add(transferAmount));
                    walletRepository.save(wallet);

                    TransactionHistory tx = new TransactionHistory();
                    tx.setTransactionCode(fullTransactionCode);
                    tx.setWallet(wallet);
                    tx.setAmount(transferAmount); // Set bằng BigDecimal
                    tx.setType(TransactionType.DEPOSIT);
                    tx.setDirection(TransactionDirection.IN);
                    tx.setStatus(TransactionStatus.COMPLETED);
                    tx.setProofUrl("SePay Ref: " + request.getReferenceCode());

                    transactionHistoryRepository.save(tx);
                    System.out.println(">>> ĐÃ CỘNG " + transferAmount + " VÀO VÍ CỦA USER_ID: " + userId);
                } else {
                    System.err.println("Webhook: Không tìm thấy Wallet cho userId = " + userId);
                }
            } else {
                System.err.println("Webhook: Nội dung CK không hợp lệ: " + content);
            }

            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            System.err.println("Webhook SePay Error: " + e.getMessage());
            return ResponseEntity.ok(Map.of("success", false, "message", e.getMessage()));
        }
    }
}