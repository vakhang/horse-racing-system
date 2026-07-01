package com.swp.horseracing.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SePayWebhookRequestDTO {
    private String gateway;
    private String transactionDate;
    private String accountNumber;
    private String subAccount;
    private String code;         // Cột này có thể chứa nội dung chuyển khoản được SePay parse sẵn
    private String content;      // Nội dung chuyển khoản thô gốc từ ngân hàng
    private String transferType; // "in" hoặc "out"
    private BigDecimal transferAmount;
    private BigDecimal accumulated;
    private String id;
    private String referenceCode;
}