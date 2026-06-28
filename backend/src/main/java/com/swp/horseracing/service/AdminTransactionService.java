package com.swp.horseracing.service;
import com.swp.horseracing.dto.CompleteWithdrawalRequestDTO;
import java.util.Map;

public interface AdminTransactionService {
    String completeWithdrawal(Integer transactionId, CompleteWithdrawalRequestDTO request);
    Map<String, Object> getFinanceDashboard();

    // Thêm 2 hàm duyệt nạp tiền
    String approveDeposit(Integer transactionId);
    String rejectDeposit(Integer transactionId);
}