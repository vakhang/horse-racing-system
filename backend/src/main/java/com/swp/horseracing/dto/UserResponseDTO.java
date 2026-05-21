package com.swp.horseracing.dto;

import com.swp.horseracing.model.RoleEnum;
import com.swp.horseracing.model.UserStatus;
import lombok.Builder;
import lombok.Data;

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
    private String kycDocumentUrl;
    private UserStatus status;
    private LocalDateTime createdAt;
}