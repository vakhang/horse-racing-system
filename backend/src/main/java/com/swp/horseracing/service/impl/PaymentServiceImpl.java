package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.DepositRequestDTO;
import com.swp.horseracing.dto.PaymentResponseDTO;
import com.swp.horseracing.repository.WalletRepository;
import com.swp.horseracing.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
@RequiredArgsConstructor
    // [Chức năng rõ ràng]: Class Triển khai Thanh toán
    // [Tác dụng]: Call API sang bên thứ 3 (Ví dụ: VietQR - vietqr.io) để lấy URL hình ảnh QR Code.
    // [Hướng dẫn sửa đổi]:
    // - Logic: Đổi STK ngân hàng thụ hưởng tại URL gọi sang VietQR nếu công ty đổi tài khoản.
public class PaymentServiceImpl implements PaymentService {

    private final WalletRepository walletRepository;

    private static final String BANK_ID = "ACB";
    private static final String ACCOUNT_NO = "26534761";
    private static final String ACCOUNT_NAME = "NGO XUAN KHANG";
    private static final String TEMPLATE = "compact";

    @Override
    public PaymentResponseDTO createDepositQR(DepositRequestDTO request) {
        walletRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví của người dùng này!"));

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền nạp phải lớn hơn 0 VNĐ!");
        }

        // CÚ PHÁP MỚI: NAP + ID Người dùng + Ký tự ngẫu nhiên (Ví dụ: NAP1X9A)
        // Điều này đảm bảo mỗi mã QR là duy nhất, nhưng ta vẫn dễ dàng bóc tách ID
        // người dùng.
        String randomSuffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String txCode = "NAP" + request.getUserId() + randomSuffix;

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
}