package com.swp.horseracing.dto;

import com.swp.horseracing.model.TransactionDirection;
import com.swp.horseracing.model.TransactionStatus;
import com.swp.horseracing.model.TransactionType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionHistoryResponseDTO {
    private String transactionCode;
    private BigDecimal amount;
    private TransactionType type;
    private TransactionDirection direction;
    private TransactionStatus status;
    private String proofUrl;
    private LocalDateTime createdAt;
}
