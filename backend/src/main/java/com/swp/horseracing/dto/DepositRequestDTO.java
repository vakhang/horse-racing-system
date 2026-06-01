package com.swp.horseracing.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DepositRequestDTO {
    private Integer userId; // Để Demo giả định lấy tài khoản người dùng
    private BigDecimal amount;
}