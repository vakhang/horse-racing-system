package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.DepositRequestDTO;
import com.swp.horseracing.dto.PaymentResponseDTO;
import com.swp.horseracing.dto.SePayWebhookRequestDTO;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.TransactionHistoryRepository;
import com.swp.horseracing.repository.WalletRepository;
import com.swp.horseracing.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final WalletRepository walletRepository;
    private final TransactionHistoryRepository transactionRepository;

    private final String BANK_ID = "ACB";
    private final String ACCOUNT_NO = "31093847";
    private final String ACCOUNT_NAME = "TRUONG LE TRI NGUYEN";
    private final String TEMPLATE = "compact";

    @Override
    public PaymentResponseDTO createDepositQR(DepositRequestDTO request) {
        Wallet wallet = walletRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví của người dùng này!"));

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền nạp phải lớn hơn 0 VNĐ!");
        }

        // Tạo mã giao dịch chứa đúng UserId (Cú pháp cố định: NAP + userId)
        String txCode = "NAP" + request.getUserId();

        // Không cần lưu PENDING vào DB nữa vì SePay Webhook sẽ tự lo toàn bộ vòng đời khi có giao dịch

        String encodedName = URLEncoder.encode(ACCOUNT_NAME, StandardCharsets.UTF_8);
        String encodedNote = URLEncoder.encode(txCode, StandardCharsets.UTF_8);
        String qrUrl = String.format("https://img.vietqr.io/image/%s-%s-%s.png?amount=%s&addInfo=%s&accountName=%s",
                BANK_ID, ACCOUNT_NO, TEMPLATE, request.getAmount().toPlainString(), encodedNote, encodedName);

        return PaymentResponseDTO.builder()
                .transactionCode(txCode)
                .amount(request.getAmount())
                .bankId(BANK_ID)
                .accountNo(ACCOUNT_NO)
                .accountName(ACCOUNT_NAME)
                .qrUrl(qrUrl)
                .note(txCode)
                .build();
    }

    @Override
    public String processWebhook(SePayWebhookRequestDTO request) {
        // Đã di chuyển nghiệp vụ này sang WebhookController để sạch sẽ hơn
        return "Migrated to WebhookController";
    }
}