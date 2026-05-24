package com.swp.horseracing.dto;

import lombok.Data;

@Data
public class LoginRequestDTO {
    private String email;
    private String password;
}