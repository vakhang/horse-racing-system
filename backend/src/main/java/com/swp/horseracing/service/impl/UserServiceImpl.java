package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.*;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.BetRepository;
import com.swp.horseracing.repository.TransactionHistoryRepository;
import com.swp.horseracing.repository.UserRepository;
import com.swp.horseracing.repository.WalletRepository;
import com.swp.horseracing.security.JwtUtils;
import com.swp.horseracing.service.FileStorageService; // <-- THÊM
import com.swp.horseracing.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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
    private final JwtUtils jwtUtils;
    private final FileStorageService fileStorageService; // Tiêm dịch vụ lưu trữ file

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
                .attachments(new java.util.ArrayList<>()) // Khởi tạo mảng
                .build();

        // 1. Lưu file KYC xuống hệ thống nếu có
        if (request.getKycFiles() != null) {
            for (MultipartFile file : request.getKycFiles()) {
                String url = fileStorageService.storeFile(file);
                if (url != null) {
                    newUser.getAttachments().add(UserAttachment.builder()
                            .user(newUser).docType(UserDocType.ID_CARD).fileUrl(url).build());
                }
            }
        }

        User savedUser = userRepository.save(newUser);

        // NẾU LÀ KHÁN GIẢ HOẶC CHỦ NGỰA THÌ MỚI TẠO VÍ
        if (request.getRole() == RoleEnum.SPECTATOR || request.getRole() == RoleEnum.OWNER) {
            BigDecimal initialBalance = (request.getRole() == RoleEnum.SPECTATOR)
                    ? new BigDecimal("100000.00")
                    : BigDecimal.ZERO;

            Wallet wallet = Wallet.builder()
                    .user(savedUser)
                    .balance(initialBalance)
                    .build();
            walletRepository.save(wallet);
        }

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

        String token = jwtUtils.generateToken(
                user.getId(),
                user.getRole().name()
        );

        UserResponseDTO response = mapToResponseDTO(user);
        response.setToken(token);
        return response;
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
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());

        // Cập nhật thông tin JOCKEY
        if (request.getWeight() != null) user.setWeight(request.getWeight());
        if (request.getHeight() != null) user.setHeight(request.getHeight());

        // Lưu file cho JOCKEY
        if (request.getCertFiles() != null) {
            for (MultipartFile file : request.getCertFiles()) {
                String url = fileStorageService.storeFile(file);
                if (url != null) user.getAttachments().add(UserAttachment.builder().user(user).docType(UserDocType.JOCKEY_CERT).fileUrl(url).build());
            }
        }
        if (request.getHealthFiles() != null) {
            for (MultipartFile file : request.getHealthFiles()) {
                String url = fileStorageService.storeFile(file);
                if (url != null) user.getAttachments().add(UserAttachment.builder().user(user).docType(UserDocType.HEALTH_CHECK).fileUrl(url).build());
            }
        }

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
        BigDecimal balance = walletRepository.findByUserId(user.getId())
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);

        // Lấy link KYC đầu tiên để trả về cho Admin
        String kycUrl = null;
        if (user.getAttachments() != null && !user.getAttachments().isEmpty()) {
            kycUrl = user.getAttachments().get(0).getFileUrl();
        }

        return UserResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .dob(user.getDob())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .phoneNumber(user.getPhoneNumber())
                .kycDocumentUrl(kycUrl) // Map link KYC
                .weight(user.getWeight())
                .height(user.getHeight())
                .balance(balance)
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