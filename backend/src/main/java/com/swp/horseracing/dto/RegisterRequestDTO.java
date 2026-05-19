package com.swp.horseracing.dto;

import com.swp.horseracing.model.RoleEnum;
import lombok.Data;
import java.time.LocalDate;

@Data
public class RegisterRequestDTO {
    private String username;
    private String password;
    private String email;
    private RoleEnum role;
    private LocalDate dob;
    private String idCardUrl;
}