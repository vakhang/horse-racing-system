package com.swp.horseracing.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SePayWebhookRequestDTO {
    private String gateway;
    private String transactionDate;
    private String accountNumber;
    private String transferType; // "in" hoặc "out"
    private BigDecimal transferAmount;
    private String transactionContent; // Nội dung chuyển khoản chứa mã NAP + userId
    private String referenceCode;
}