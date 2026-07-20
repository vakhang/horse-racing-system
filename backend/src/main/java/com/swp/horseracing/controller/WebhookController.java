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

            // TÌM CỤM TỪ BẮT ĐẦU BẰNG "NAP" VÀ CÁC KÝ TỰ LIỀN KỀ (Cả chữ và số)
            Pattern pattern = Pattern.compile("NAP[A-Z0-9]+");
            Matcher matcher = pattern.matcher(content);

            if (matcher.find()) {
                // Lấy toàn bộ mã giao dịch gốc do chúng ta sinh ra (Ví dụ: NAP34447 hoặc NAP10A1B2)
                String fullTransactionCode = matcher.group();

                // Mã giao dịch hợp lệ phải dài hơn 7 ký tự: "NAP" (3) + UserId (ít nhất 1) + Suffix ngẫu nhiên (4)
                if (fullTransactionCode.length() > 7) {

                    // ĐIỂM FIX LỖI: Tách UserId bằng cách cắt chính xác 3 ký tự "NAP" đầu và 4 ký tự suffix cuối
                    String userIdStr = fullTransactionCode.substring(3, fullTransactionCode.length() - 4);
                    Integer userId = Integer.parseInt(userIdStr);

                    Wallet wallet = walletRepository.findByUserId(userId).orElse(null);

                    if (wallet != null) {
                        BigDecimal transferAmount = BigDecimal.valueOf(request.getTransferAmount());

                        // Cộng tiền vào ví bằng BigDecimal
                        wallet.setBalance(wallet.getBalance().add(transferAmount));
                        walletRepository.save(wallet);

                        TransactionHistory tx = new TransactionHistory();
                        tx.setTransactionCode(fullTransactionCode);
                        tx.setWallet(wallet);
                        tx.setAmount(transferAmount);
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
                    System.err.println("Webhook: Mã giao dịch quá ngắn, không hợp lệ: " + fullTransactionCode);
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