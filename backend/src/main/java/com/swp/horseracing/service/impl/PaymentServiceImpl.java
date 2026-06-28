package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.DepositRequestDTO;
import com.swp.horseracing.dto.PaymentResponseDTO;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.TransactionHistoryRepository;
import com.swp.horseracing.repository.WalletRepository;
import com.swp.horseracing.service.CloudinaryService;
import com.swp.horseracing.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final WalletRepository walletRepository;
    private final TransactionHistoryRepository transactionRepository;
    private final CloudinaryService cloudinaryService;

    // TÀI KHOẢN NGÂN HÀNG NHẬN TIỀN CỦA HỆ THỐNG
    private final String BANK_ID = "ACB";
    private final String ACCOUNT_NO = "31093847";
    private final String ACCOUNT_NAME = "TRUONG LE TRI NGUYEN";
    private final String TEMPLATE = "compact";

    @Override
    @Transactional
    public PaymentResponseDTO createDepositQR(DepositRequestDTO request) {
        Wallet wallet = walletRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví của người dùng này!"));

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền nạp phải lớn hơn 0 VNĐ!");
        }

        // 1. Tạo mã giao dịch duy nhất có tiền tố NAP
        String txCode = "NAP" + System.currentTimeMillis() / 1000;

        // 2. Lưu lịch sử giao dịch vào Sổ cái với trạng thái PENDING
        TransactionHistory tx = new TransactionHistory();
        tx.setTransactionCode(txCode);
        tx.setWallet(wallet);
        tx.setAmount(request.getAmount());
        tx.setType(TransactionType.DEPOSIT);
        tx.setDirection(TransactionDirection.IN);
        tx.setStatus(TransactionStatus.PENDING);
        transactionRepository.save(tx);

        // 3. Link sinh mã QR động tự điền số tiền và mã giao dịch
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
    @Transactional
    public String confirmPayment(String transactionCode, MultipartFile file) throws IOException {
        TransactionHistory tx = transactionRepository.findByTransactionCode(transactionCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giao dịch chuyển khoản!"));

        if (tx.getStatus() != TransactionStatus.PENDING) {
            throw new RuntimeException("Giao dịch này đã được xử lý từ trước!");
        }

        // Tải ảnh lên Cloudinary
        String proofUrl = cloudinaryService.uploadFile(file);

        // Cập nhật link ảnh vào DB nhưng VẪN GIỮ TRẠNG THÁI PENDING CHỜ ADMIN DUYỆT
        tx.setProofUrl(proofUrl);
        transactionRepository.save(tx);

        return "Tải minh chứng thành công! Vui lòng chờ Admin kiểm tra và duyệt lệnh nạp tiền.";
    }
}