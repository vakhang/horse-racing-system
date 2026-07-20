
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
    private java.util.List<org.springframework.web.multipart.MultipartFile> kycFiles;
    private UserStatus status;
    private String phoneNumber;
    private Double weight;
    private Double height;
    private java.util.List<org.springframework.web.multipart.MultipartFile> certFiles;
    private java.util.List<org.springframework.web.multipart.MultipartFile> healthFiles;
}