package com.swp.horseracing.service;

import com.swp.horseracing.dto.LoginRequestDTO;
import com.swp.horseracing.dto.RegisterRequestDTO;
import com.swp.horseracing.dto.UserResponseDTO;
import com.swp.horseracing.dto.UserUpdateRequestDTO;
import com.swp.horseracing.dto.BetHistoryResponseDTO;
import com.swp.horseracing.dto.TransactionHistoryResponseDTO;
import com.swp.horseracing.model.UserStatus;

import java.util.List;

public interface UserService {
    UserResponseDTO registerUser(RegisterRequestDTO request);

    List<UserResponseDTO> getAllUsers();
    UserResponseDTO getUserById(Integer id);

    UserResponseDTO updateUser(Integer id, UserUpdateRequestDTO request);

    // BỔ SUNG: Hàm cập nhật trạng thái nhanh cho Admin
    UserResponseDTO updateUserStatus(Integer id, UserStatus status);

    UserResponseDTO loginUser(LoginRequestDTO request);
    void deleteUser(Integer id);

    List<BetHistoryResponseDTO> getMyBets(Integer userId);
    List<TransactionHistoryResponseDTO> getMyTransactions(Integer userId);
}