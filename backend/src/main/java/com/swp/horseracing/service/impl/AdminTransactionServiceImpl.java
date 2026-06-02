package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.CompleteWithdrawalRequestDTO;
import com.swp.horseracing.model.TransactionHistory;
import com.swp.horseracing.model.TransactionStatus;
import com.swp.horseracing.model.TransactionType;
import com.swp.horseracing.repository.TransactionHistoryRepository;
import com.swp.horseracing.service.AdminTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminTransactionServiceImpl implements AdminTransactionService {

    private final TransactionHistoryRepository transactionRepository;

    @Override
    @Transactional
    public String completeWithdrawal(Integer transactionId, CompleteWithdrawalRequestDTO request) {
        TransactionHistory history = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch này!"));

        if (history.getType() != TransactionType.WITHDRAW) {
            throw new RuntimeException("Đây không phải là giao dịch rút tiền!");
        }

        if (history.getStatus() == TransactionStatus.COMPLETED) {
            throw new RuntimeException("Giao dịch này đã được hoàn tất trước đó!");
        }

        if (request.getProofUrl() == null || request.getProofUrl().trim().isEmpty()) {
            throw new RuntimeException("Phải cung cấp link hình ảnh (proof_url) chuyển khoản!");
        }

        // Cập nhật trạng thái và link ảnh
        history.setStatus(TransactionStatus.COMPLETED);
        history.setProofUrl(request.getProofUrl());
        transactionRepository.save(history);

        return "Duyệt lệnh rút tiền thành công!";
    }
}
