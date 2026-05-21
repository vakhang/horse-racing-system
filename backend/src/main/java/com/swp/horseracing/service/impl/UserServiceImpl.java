package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.RegisterRequestDTO;
import com.swp.horseracing.dto.UserResponseDTO;
import com.swp.horseracing.dto.UserUpdateRequestDTO;
import com.swp.horseracing.model.RoleEnum;
import com.swp.horseracing.model.User;
import com.swp.horseracing.model.UserStatus;
import com.swp.horseracing.model.Wallet;
import com.swp.horseracing.repository.UserRepository;
import com.swp.horseracing.repository.WalletRepository;
import com.swp.horseracing.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;

    @Override
    @Transactional
    public UserResponseDTO registerUser(RegisterRequestDTO request) {
        // 1. Check trùng Email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email này đã được sử dụng!");
        }

        // 2. Check tuổi >= 21
        if (request.getDob() != null) {
            int age = Period.between(request.getDob(), LocalDate.now()).getYears();
            if (age < 21) {
                throw new RuntimeException("Bạn phải từ 21 tuổi trở lên mới được tham gia!");
            }
        } else {
            throw new RuntimeException("Vui lòng cung cấp ngày sinh!");
        }

        // 3. Tạo User mới
        User newUser = User.builder()
                .username(request.getUsername())
                .password(request.getPassword()) // TODO: Mã hóa Bcrypt sau
                .email(request.getEmail())
                .role(request.getRole())
                .dob(request.getDob())
                .kycDocumentUrl(request.getKycDocumentUrl())
                .status(UserStatus.PENDING) // Luôn là PENDING chờ duyệt
                .build();

        User savedUser = userRepository.save(newUser);

        // 4. Tự động tạo Ví (Wallet)
        // Nếu là Khán giả (SPECTATOR), cấp sẵn 100,000, còn lại cấp 0
        BigDecimal initialBalance = (request.getRole() == RoleEnum.SPECTATOR)
                ? new BigDecimal("100000.00")
                : BigDecimal.ZERO;

        Wallet wallet = Wallet.builder()
                .user(savedUser)
                .balance(initialBalance)
                .build();
        walletRepository.save(wallet);

        return mapToResponseDTO(savedUser);
    }

    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDTO getUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + id));
        return mapToResponseDTO(user);
    }

    @Override
    @Transactional
    public UserResponseDTO updateUser(Integer id, UserUpdateRequestDTO request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + id));

        // Cập nhật các trường được phép
        if (request.getUsername() != null) user.setUsername(request.getUsername());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getDob() != null) user.setDob(request.getDob());
        if (request.getKycDocumentUrl() != null) user.setKycDocumentUrl(request.getKycDocumentUrl());
        if (request.getStatus() != null) user.setStatus(request.getStatus());

        User updatedUser = userRepository.save(user);
        return mapToResponseDTO(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy User với ID: " + id);
        }
        // Vì trong Entity Wallet chưa cài Cascade, ta nên để JPA tự xóa hoặc xóa thủ công nếu cần.
        // Tạm thời UserRepository xóa sẽ báo lỗi nếu Wallet đang tham chiếu,
        // ta sẽ fix bằng cách xóa theo id.
        userRepository.deleteById(id);
    }

    // Hàm phụ trợ để chuyển đổi từ User Entity sang DTO
    private UserResponseDTO mapToResponseDTO(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .dob(user.getDob())
                .kycDocumentUrl(user.getKycDocumentUrl())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}