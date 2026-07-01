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
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final WalletRepository walletRepository;
    private final TransactionHistoryRepository transactionRepository;

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
    public String processWebhook(SePayWebhookRequestDTO request) {
        // BƯỚC 1: Lọc rác - Chỉ bắt giao dịch TIỀN VÀO (IN)
        if (!"in".equalsIgnoreCase(request.getTransferType())) {
            return "Ignored: Not an incoming transfer.";
        }

        // BƯỚC 2: Trích xuất nội dung chuyển khoản
        String rawNote = request.getCode() != null ? request.getCode().toUpperCase() : "";
        if (rawNote.isEmpty() && request.getContent() != null) {
            rawNote = request.getContent().toUpperCase();
        }

        // BƯỚC 3: Dùng Regex săn tìm mã "NAP..." trong chuỗi ghi chú lộn xộn của ngân hàng
        Matcher matcher = Pattern.compile("NAP\\d+").matcher(rawNote);
        if (!matcher.find()) {
            return "Ignored: No valid NAP transaction code found in note.";
        }
        String transactionCode = matcher.group();

        TransactionHistory tx = transactionRepository.findByTransactionCode(transactionCode)
                .orElseThrow(() -> new RuntimeException("Transaction Code Not Found in Database!"));

        // BƯỚC 4: Rào cản trạng thái
        if (tx.getStatus() == TransactionStatus.COMPLETED) {
            return "Ignored: Transaction already completed.";
        }

        // BƯỚC 5: Xác thực số tiền thực chuyển vs Số tiền khai báo lúc tạo mã QR
        if (request.getTransferAmount().compareTo(tx.getAmount()) < 0) {
            // Nạp thiếu tiền -> Đánh dấu Thất Bại & Lưu vết nguyên nhân vào cọt Proof
            tx.setStatus(TransactionStatus.REJECTED);
            tx.setProofUrl("HỦY: Số tiền nạp thực tế (" + request.getTransferAmount() + ") nhỏ hơn yêu cầu ban đầu (" + tx.getAmount() + ")");
            transactionRepository.save(tx);
            return "Rejected: Insufficient fund transferred.";
        }

        // BƯỚC 6: XỬ LÝ THÀNH CÔNG - CỘNG TIỀN CHO USER
        tx.setStatus(TransactionStatus.COMPLETED);
        tx.setProofUrl("AUTO-APPROVED BY SEPAY WEBHOOK (Ref: " + request.getReferenceCode() + ")");
        transactionRepository.save(tx);

        Wallet wallet = tx.getWallet();
        wallet.setBalance(wallet.getBalance().add(tx.getAmount()));
        walletRepository.save(wallet);

        return "Processed: Wallet Top-up successful.";
    }
}