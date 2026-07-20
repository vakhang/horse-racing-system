package com.swp.horseracing.service;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

public interface AdminTransactionService {
    String completeWithdrawal(Integer transactionId, MultipartFile proofFile);
    Map<String, Object> getFinanceDashboard();
    String approveDeposit(Integer transactionId);
    String rejectDeposit(Integer transactionId);
}