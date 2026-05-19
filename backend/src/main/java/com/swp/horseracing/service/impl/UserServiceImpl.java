package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.RegisterRequestDTO;
import com.swp.horseracing.model.RoleEnum;
import com.swp.horseracing.model.User;
import com.swp.horseracing.model.UserStatus;
import com.swp.horseracing.model.Wallet;
import com.swp.horseracing.repository.UserRepository;
import com.swp.horseracing.repository.WalletRepository;
import com.swp.horseracing.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;

    @Override
    public User registerUser(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email này đã được sử dụng!");
        }

        // --- LOGIC KIỂM TRA ĐỘ TUỔI (Bắt buộc >= 21) ---
        if (request.getDob() == null) {
            throw new RuntimeException("Vui lòng cung cấp ngày sinh!");
        }
        int age = Period.between(request.getDob(), LocalDate.now()).getYears();
        if (age < 21) {
            throw new RuntimeException("Bạn chưa đủ 21 tuổi để tham gia hệ thống!");
        }
        // ----------------------------------------------

        User newUser = User.builder()
                .username(request.getUsername())
                .password(request.getPassword())
                .email(request.getEmail())
                .role(request.getRole())
                .dob(request.getDob())
                .idCardUrl(request.getIdCardUrl())
                .status(UserStatus.PENDING) // Mặc định là chờ Admin duyệt
                .build();

        User savedUser = userRepository.save(newUser);

        if (savedUser.getRole() == RoleEnum.OWNER ||
                savedUser.getRole() == RoleEnum.JOCKEY ||
                savedUser.getRole() == RoleEnum.SPECTATOR) {

            Wallet newWallet = Wallet.builder()
                    .user(savedUser)
                    .balance(BigDecimal.ZERO)
                    .build();
            walletRepository.save(newWallet);
        }

        return savedUser;
    }
}