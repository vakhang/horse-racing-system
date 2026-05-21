package com.swp.horseracing.service;

import com.swp.horseracing.dto.RegisterRequestDTO;
import com.swp.horseracing.dto.UserResponseDTO;
import com.swp.horseracing.dto.UserUpdateRequestDTO;

import java.util.List;

public interface UserService {
    UserResponseDTO registerUser(RegisterRequestDTO request);

    List<UserResponseDTO> getAllUsers();
    UserResponseDTO getUserById(Integer id);

    UserResponseDTO updateUser(Integer id, UserUpdateRequestDTO request);

    void deleteUser(Integer id);
}