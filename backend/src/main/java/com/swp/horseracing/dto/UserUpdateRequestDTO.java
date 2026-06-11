package com.swp.horseracing.dto;

import com.swp.horseracing.model.RoleEnum;
import com.swp.horseracing.model.UserStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UserUpdateRequestDTO {
    private String username;
    private RoleEnum role;
    private LocalDate dob;
    private String kycDocumentUrl;
    private UserStatus status;
    private String phoneNumber;
}