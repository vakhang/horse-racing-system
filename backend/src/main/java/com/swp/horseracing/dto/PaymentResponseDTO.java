package com.swp.horseracing.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class PaymentResponseDTO {
    private String transactionCode;
    private BigDecimal amount;
    private String bankId;
    private String accountNo;
    private String accountName;
    private String qrUrl;
    private String note; // Nội dung chuyển khoản bắt buộc
}