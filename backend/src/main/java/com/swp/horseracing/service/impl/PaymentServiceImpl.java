package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.DepositRequestDTO;
import com.swp.horseracing.dto.PaymentResponseDTO;
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

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final WalletRepository walletRepository;
    private final TransactionHistoryRepository transactionRepository;

    // Cấu hình tài khoản ngân hàng của Công ty/Hệ thống nhận tiền
    private final String BANK_ID = "MB"; // Ngân hàng Quân Đội MBBank
    private final String ACCOUNT_NO = "999999999999";
    private final String ACCOUNT_NAME = "CONG TY CONG NGHE HORSE RACING";
    private final String TEMPLATE = "compact"; // Mẫu QR hiển thị cả Số tiền và Nội dung trên ảnh cho khách kiểm tra

    @Override
    @Transactional
    public PaymentResponseDTO createDepositQR(DepositRequestDTO request) {
        // Tìm ví của User dựa vào userId giống như thiết kế hiện tại
        Wallet wallet = walletRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví của người dùng này!"));

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền nạp phải lớn hơn 0 VNĐ!");
        }

        // 1. Tạo mã giao dịch duy nhất có tiền tố DEP (Deposit)
        String txCode = "DEP" + System.currentTimeMillis() / 1000;

        // 2. Lưu lịch sử giao dịch vào Sổ cái với trạng thái PENDING (Chờ thanh toán)
        TransactionHistory tx = new TransactionHistory();
        tx.setTransactionCode(txCode);
        tx.setWallet(wallet);
        tx.setAmount(request.getAmount());
        tx.setType(TransactionType.DEPOSIT);
        tx.setDirection(TransactionDirection.IN);
        tx.setStatus(TransactionStatus.PENDING);
//        tx.setNote("Nạp tiền qua mã QR: " + txCode);
        transactionRepository.save(tx);

        // 3. Encode các tham số để tạo đường link VietQR chuẩn không bị lỗi font tiếng Việt
        String encodedName = URLEncoder.encode(ACCOUNT_NAME, StandardCharsets.UTF_8);
        String encodedNote = URLEncoder.encode(txCode, StandardCharsets.UTF_8);

        // Link sinh mã QR động tự điền số tiền và mã giao dịch vào app ngân hàng khi quét
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
    public String confirmPayment(String transactionCode, String proofUrl) {
        TransactionHistory tx = transactionRepository.findByTransactionCode(transactionCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giao dịch chuyển khoản!"));

        if (tx.getStatus() != TransactionStatus.PENDING) {
            throw new RuntimeException("Giao dịch này đã được xử lý từ trước!");
        }

        // 1. Lưu ảnh hóa đơn (minh chứng giao dịch) do người dùng tải lên
        tx.setProofUrl(proofUrl);
        tx.setStatus(TransactionStatus.COMPLETED); // Chuyển trạng thái thành công
        transactionRepository.save(tx);

        // 2. Cộng tiền trực tiếp vào Ví của người chơi
        Wallet wallet = tx.getWallet();
        wallet.setBalance(wallet.getBalance().add(tx.getAmount()));
        walletRepository.save(wallet);

        return "Nạp tiền thành công! Số dư tài khoản đã được cập nhật.";
    }
}