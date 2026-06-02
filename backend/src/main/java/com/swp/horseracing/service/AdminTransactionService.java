package com.swp.horseracing.service;

import com.swp.horseracing.dto.CompleteWithdrawalRequestDTO;

public interface AdminTransactionService {
    String completeWithdrawal(Integer transactionId, CompleteWithdrawalRequestDTO request);
}
