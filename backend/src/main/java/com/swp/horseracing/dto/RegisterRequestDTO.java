package com.swp.horseracing.dto;

import com.swp.horseracing.model.RoleEnum;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.List;

@Data
public class RegisterRequestDTO {
    private String username;
    private String password;
    private String email;

    private String phoneNumber;
    private String idNumber;
    private LocalDate idIssueDate;
    private String idIssuePlace;
    private String pinCode;

    // CÁC TRƯỜNG LƯU TRẠNG THÁI ĐỒNG Ý PHÁP LÝ (MỚI)
    private Boolean agreedRule1;
    private Boolean agreedRule2;
    private Boolean agreedRule3;
    private Boolean agreedRule4;

    private RoleEnum role;
    private LocalDate dob;
    private List<MultipartFile> kycFiles;
}
