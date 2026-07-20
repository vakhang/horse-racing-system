package com.swp.horseracing.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class WithdrawRequestDTO {
    private Integer userId;
    private BigDecimal amount;
    private String bankName;
    private String accountNumber;
    private String accountName;
}