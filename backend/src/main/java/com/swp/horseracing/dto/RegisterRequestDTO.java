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
    private RoleEnum role;
    private LocalDate dob;

    // Thêm trường này để hứng danh sách file KYC từ Frontend
    private List<MultipartFile> kycFiles;
}