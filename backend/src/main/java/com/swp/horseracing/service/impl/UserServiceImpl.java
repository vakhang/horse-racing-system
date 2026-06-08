package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.*;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.BetRepository;
import com.swp.horseracing.repository.TransactionHistoryRepository;
import com.swp.horseracing.repository.UserRepository;
import com.swp.horseracing.repository.WalletRepository;
import com.swp.horseracing.security.JwtUtils; // <-- THÊM IMPORT NÀY
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
    private final BetRepository betRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final JwtUtils jwtUtils; // <-- TIÊM MÁY IN VÉ VÀO ĐÂY

    @Override
    @Transactional
    public UserResponseDTO registerUser(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email này đã được sử dụng!");
        }

        if (request.getDob() != null) {
            int age = Period.between(request.getDob(), LocalDate.now()).getYears();
            if (age < 21) {
                throw new RuntimeException("Bạn phải từ 21 tuổi trở lên mới được tham gia!");
            }
        } else {
            throw new RuntimeException("Vui lòng cung cấp ngày sinh!");
        }

        User newUser = User.builder()
                .username(request.getUsername())
                .password(request.getPassword())
                .email(request.getEmail())
                .role(request.getRole())
                .dob(request.getDob())
                .status(UserStatus.PENDING)
                .build();

        User savedUser = userRepository.save(newUser);

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
    public UserResponseDTO loginUser(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không chính xác!"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Email hoặc mật khẩu không chính xác!");
        }

        if (user.getStatus() == UserStatus.PENDING) {
            throw new RuntimeException("Tài khoản của bạn đang chờ Admin duyệt KYC. Vui lòng quay lại sau!");
        }
        if (user.getStatus() == UserStatus.REJECTED) {
            throw new RuntimeException("Tài liệu KYC của bạn đã bị từ chối. Không thể đăng nhập!");
        }

        // --- ĐOẠN NÀY LÀ TẠO VÀ NHÉT TOKEN VÀO ---
        String token = jwtUtils.generateToken(user.getId());

        return UserResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .dob(user.getDob())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .token(token) // <--- VÉ VIP CỦA SẾP ĐÂY
                .build();
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

        if (request.getUsername() != null) user.setUsername(request.getUsername());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getDob() != null) user.setDob(request.getDob());
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
        userRepository.deleteById(id);
    }

    private UserResponseDTO mapToResponseDTO(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .dob(user.getDob())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    public List<BetHistoryResponseDTO> getMyBets(Integer userId) {
        List<Bet> bets = betRepository.findBySpectatorIdOrderByCreatedAtDesc(userId);

        return bets.stream().map(bet -> BetHistoryResponseDTO.builder()
                .id(bet.getId())
                .raceName(bet.getRace().getName())
                .horseName(bet.getRegistration().getHorse().getName())
                .amount(bet.getAmount())
                .odds(bet.getOdds())
                .rewardAmount(bet.getStatus() == BetStatus.WON ? bet.getReward() : BigDecimal.ZERO)
                .status(bet.getStatus())
                .createdAt(bet.getCreatedAt())
                .build()).collect(Collectors.toList());
    }

    @Override
    public List<TransactionHistoryResponseDTO> getMyTransactions(Integer userId) {
        List<TransactionHistory> txs = transactionHistoryRepository.findByWallet_UserIdOrderByCreatedAtDesc(userId);

        return txs.stream().map(tx -> TransactionHistoryResponseDTO.builder()
                .transactionCode(tx.getTransactionCode())
                .amount(tx.getAmount())
                .type(tx.getType())
                .direction(tx.getDirection())
                .status(tx.getStatus())
                .proofUrl(tx.getProofUrl())
                .createdAt(tx.getCreatedAt())
                .build()).collect(Collectors.toList());
    }
}