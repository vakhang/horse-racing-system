package com.swp.horseracing.service;

import com.swp.horseracing.dto.RegisterRequestDTO;
import com.swp.horseracing.model.User;

public interface UserService {
    User registerUser(RegisterRequestDTO request);
}