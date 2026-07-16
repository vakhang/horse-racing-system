package com.swp.horseracing.dto;

import com.swp.horseracing.model.RoleEnum;
import com.swp.horseracing.model.UserStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class UserResponseDTO {
    private Integer id;
    private String username;
    private String email;
    private RoleEnum role;
    private LocalDate dob;
    private String phoneNumber;
    private UserStatus status;
    private LocalDateTime createdAt;
    private String token;

    // Bổ sung thông tin cho Admin kiểm duyệt KYC
    private String kycDocumentUrl;

    // Các thông số thêm của JOCKEY
    private Double weight;
    private Double height;

    private BigDecimal balance; // ADMIN CẦN XEM SỐ DƯ
}