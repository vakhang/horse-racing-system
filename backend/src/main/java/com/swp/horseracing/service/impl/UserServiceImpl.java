package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.*;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.BetRepository;
import com.swp.horseracing.repository.TransactionHistoryRepository;
import com.swp.horseracing.repository.UserAttachmentRepository;
import com.swp.horseracing.repository.UserRepository;
import com.swp.horseracing.repository.WalletRepository;
import com.swp.horseracing.security.JwtUtils;
import com.swp.horseracing.service.FileStorageService;
import com.swp.horseracing.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserAttachmentRepository userAttachmentRepository;
    private final WalletRepository walletRepository;
    private final BetRepository betRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final JwtUtils jwtUtils;
    private final FileStorageService fileStorageService;
    private final com.swp.horseracing.repository.RegistrationRepository registrationRepository;
    private final com.swp.horseracing.repository.JockeyInvitationRepository jockeyInvitationRepository;

    @Override
    public List<com.swp.horseracing.dto.JockeyMarketResponseDTO> getJockeyMarket() {
        List<User> jockeys = userRepository.findByRole(RoleEnum.JOCKEY);
        return jockeys.stream()
                .filter(j -> j.getStatus() == UserStatus.APPROVED && j.getWeight() != null && j.getHeight() != null)
                .filter(j -> {
                    // Cần có CCCD, Chứng chỉ Nài, Khám sức khỏe
                    long requiredDocs = j.getAttachments().stream()
                            .filter(a -> a.getDocType() == UserDocType.ID_CARD 
                                      || a.getDocType() == UserDocType.JOCKEY_CERT 
                                      || a.getDocType() == UserDocType.HEALTH_CHECK)
                            .map(UserAttachment::getDocType)
                            .distinct()
                            .count();
                    return requiredDocs == 3;
                })
                .map(j -> {
                    List<JockeyInvitation> invitations = jockeyInvitationRepository.findByJockeyId(j.getId());
                    String status = "SẴN SÀNG";
                    boolean hasPending = false;

                    for (JockeyInvitation inv : invitations) {
                        if (inv.getStatus() == InvitationStatus.ACCEPTED) {
                            RaceStatus rs = inv.getRegistration().getRace().getStatus();
                            if (rs != RaceStatus.COMPLETED && rs != RaceStatus.CANCELED) {
                                status = "ĐANG CÓ LỊCH";
                                break;
                            }
                        } else if (inv.getStatus() == InvitationStatus.PENDING) {
                            hasPending = true;
                        }
                    }

                    if (status.equals("SẴN SÀNG") && hasPending) {
                        status = "CHỜ DUYỆT";
                    }

                    String avatarUrl = j.getAttachments().stream()
                            .filter(a -> a.getDocType() == UserDocType.AVATAR)
                            .map(UserAttachment::getFileUrl)
                            .findFirst().orElse(null);

                    return com.swp.horseracing.dto.JockeyMarketResponseDTO.builder()
                            .id(j.getId())
                            .username(j.getUsername())
                            .weight(j.getWeight())
                            .height(j.getHeight())
                            .phone(j.getPhoneNumber())
                            .email(j.getEmail())
                            .status(status)
                            .avatarUrl(avatarUrl)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // [Chức năng rõ ràng]: Đăng ký Tài khoản (User Registration)
    // [Tác dụng]: Xử lý logic tạo tài khoản mới. Kiểm tra email, username trùng lặp. Cấp sẵn một ví 0đ. Hỗ trợ tài khoản mặc định và tài khoản chờ duyệt (KYC).
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Đổi điều kiện role cấp ngay `RoleEnum.SPECTATOR` hoặc chờ duyệt `RoleEnum.PENDING_KYC` ở đoạn switch(request.getRole()).
    @Override
    @Transactional
    public UserResponseDTO registerUser(RegisterRequestDTO request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty() ||
                request.getPassword() == null || request.getPassword().isEmpty() ||
                request.getEmail() == null || request.getEmail().trim().isEmpty() ||
                request.getPhoneNumber() == null || request.getPhoneNumber().trim().isEmpty() ||
                request.getIdNumber() == null || request.getIdNumber().trim().isEmpty()) {
            throw new RuntimeException("Vui lòng điền đầy đủ các thông tin bắt buộc!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email này đã được sử dụng!");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Số điện thoại này đã được sử dụng!");
        }
        if (userRepository.existsByIdNumber(request.getIdNumber())) {
            throw new RuntimeException("Số CCCD/Hộ chiếu này đã được sử dụng!");
        }

        // Bổ sung chặn phía Backend nếu cố tình bypass Frontend để gửi API không có file
        if (request.getKycFiles() == null || request.getKycFiles().isEmpty()) {
            throw new RuntimeException("BẮT BUỘC: Bạn phải tải lên hình ảnh / tài liệu KYC!");
        }

        // KIỂM TRA ĐÃ TICK ĐỦ CÁC Ô ĐỒNG Ý ĐIỀU KHOẢN CHƯA
        if (!Boolean.TRUE.equals(request.getAgreedRule1()) ||
                !Boolean.TRUE.equals(request.getAgreedRule2()) ||
                !Boolean.TRUE.equals(request.getAgreedRule3())) {
            throw new RuntimeException("BẮT BUỘC: Bạn phải đồng ý với tất cả các điều khoản pháp lý!");
        }
        if (request.getRole() == RoleEnum.SPECTATOR && !Boolean.TRUE.equals(request.getAgreedRule4())) {
            throw new RuntimeException("BẮT BUỘC: Khán giả phải đồng ý đủ 4 điều khoản pháp lý!");
        }

        if (request.getDob() != null) {
            int age = Period.between(request.getDob(), LocalDate.now()).getYears();
            if (request.getRole() == RoleEnum.SPECTATOR) {
                if (age < 21) {
                    throw new RuntimeException("Khán giả tham gia cá cược phải từ 21 tuổi trở lên!");
                }
            } else {
                if (age < 18) {
                    throw new RuntimeException("Bạn phải từ 18 tuổi trở lên để đăng ký vai trò này!");
                }
            }
        } else {
            throw new RuntimeException("Vui lòng cung cấp ngày sinh!");
        }

        if (request.getPinCode() == null || !request.getPinCode().matches("\\d{6}")) {
            throw new RuntimeException("BẮT BUỘC: Bạn phải thiết lập mã PIN 6 số!");
        }

        User newUser = User.builder()
                .username(request.getUsername())
                .password(request.getPassword())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .idNumber(request.getIdNumber())
                .idIssueDate(request.getIdIssueDate())
                .idIssuePlace(request.getIdIssuePlace())
                .pinCode(request.getPinCode())
                .agreedRule1(request.getAgreedRule1()) // Lưu DB
                .agreedRule2(request.getAgreedRule2()) // Lưu DB
                .agreedRule3(request.getAgreedRule3()) // Lưu DB
                .agreedRule4(request.getAgreedRule4()) // Lưu DB
                .role(request.getRole())
                .dob(request.getDob())
                .status(UserStatus.PENDING)
                .attachments(new java.util.ArrayList<>())
                .build();

        String folder = "users/" + request.getEmail().replace("@", "_") + "_" + request.getRole().name();

        if (request.getKycFiles() != null) {
            for (MultipartFile file : request.getKycFiles()) {
                String url = fileStorageService.storeFile(file, folder);
                if (url != null) {
                    newUser.getAttachments().add(UserAttachment.builder()
                            .user(newUser).docType(UserDocType.ID_CARD).fileUrl(url).build());
                }
            }
        }

        User savedUser = userRepository.save(newUser);

        // Lưu explicitly các file KYC
        if (!savedUser.getAttachments().isEmpty()) {
            for (UserAttachment att : savedUser.getAttachments()) {
                att.setUser(savedUser);
            }
            userAttachmentRepository.saveAll(savedUser.getAttachments());
        }

        // Khởi tạo ví: Khán giả (SPECTATOR) được tặng 100.000 VNĐ trải nghiệm, các role khác là 0 đồng.
        BigDecimal initialBalance = savedUser.getRole() == RoleEnum.SPECTATOR ? new BigDecimal("100000.00") : BigDecimal.ZERO;
        Wallet wallet = Wallet.builder()
                .user(savedUser)
                .balance(initialBalance)
                .build();
        wallet = walletRepository.save(wallet);

        if (initialBalance.compareTo(BigDecimal.ZERO) > 0) {
            com.swp.horseracing.model.TransactionHistory th = com.swp.horseracing.model.TransactionHistory.builder()
                    .wallet(wallet)
                    .transactionCode("BONUS00" + savedUser.getId())
                    .type(TransactionType.BONUS)
                    .direction(com.swp.horseracing.model.TransactionDirection.IN)
                    .amount(initialBalance)
                    .status(com.swp.horseracing.model.TransactionStatus.COMPLETED)
                    .build();
            transactionHistoryRepository.save(th);
        }

        return mapToResponseDTO(savedUser);
    }

    // [Chức năng rõ ràng]: Đăng nhập (User Login)
    // [Tác dụng]: Xác thực thông tin người dùng và sinh ra chuỗi mã hóa JWT token nếu hợp lệ. Ngược lại báo lỗi.
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Sửa đổi cách thức kiểm tra mật khẩu (ví dụ dùng BCrypt thay vì so sánh chuỗi thường) ở dòng `!user.getPassword().equals(request.getPassword())`.
    @Override
    public UserResponseDTO loginUser(LoginRequestDTO request) {
        // ĐÃ SỬA: Hỗ trợ tìm bằng cả Email hoặc Số điện thoại
        User user = userRepository.findByEmailOrPhoneNumber(request.getEmail(), request.getEmail())
                .orElseThrow(() -> new RuntimeException("Tài khoản hoặc mật khẩu không chính xác!"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Tài khoản hoặc mật khẩu không chính xác!");
        }
        if (user.getStatus() == UserStatus.PENDING) {
            throw new RuntimeException("Tài khoản của bạn đang chờ Admin duyệt KYC. Vui lòng quay lại sau!");
        }
        if (user.getStatus() == UserStatus.REJECTED) {
            String reason = user.getBanReason() != null ? user.getBanReason() : "Tài liệu KYC của bạn đã bị từ chối. Không thể đăng nhập!";
            throw new RuntimeException("REJECTED:" + reason);
        }
        if (user.getStatus() == UserStatus.BANNED) {
            String reason = user.getBanReason() != null ? user.getBanReason() : "Tài khoản của bạn đã bị Quản trị viên (Admin) khóa do nghi ngờ vi phạm quy định của hệ thống hoặc có hành vi gian lận trong quá trình tham gia.";
            throw new RuntimeException("BANNED:" + reason);
        }

        String token = jwtUtils.generateToken(user.getId(), user.getRole().name());
        UserResponseDTO response = mapToResponseDTO(user);
        response.setToken(token);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
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

        if (request.getUsername() != null)
            user.setUsername(request.getUsername());
        if (request.getRole() != null)
            user.setRole(request.getRole());
        if (request.getDob() != null)
            user.setDob(request.getDob());
        if (request.getStatus() != null)
            user.setStatus(request.getStatus());
        if (request.getPhoneNumber() != null)
            user.setPhoneNumber(request.getPhoneNumber());
        if (request.getWeight() != null)
            user.setWeight(request.getWeight());
        if (request.getHeight() != null)
            user.setHeight(request.getHeight());

        String folder = "users/" + user.getEmail().replace("@", "_") + "_" + user.getRole().name();

        if (request.getKycFiles() != null) {
            for (MultipartFile file : request.getKycFiles()) {
                String url = fileStorageService.storeFile(file, folder);
                if (url != null)
                    user.getAttachments()
                            .add(UserAttachment.builder().user(user).docType(UserDocType.ID_CARD).fileUrl(url).build());
            }
        }
        if (request.getCertFiles() != null) {
            for (MultipartFile file : request.getCertFiles()) {
                String url = fileStorageService.storeFile(file, folder);
                if (url != null) {
                    UserDocType docType = user.getRole() == RoleEnum.REFEREE ? UserDocType.REFEREE_CERT : UserDocType.JOCKEY_CERT;
                    user.getAttachments().add(
                            UserAttachment.builder().user(user).docType(docType).fileUrl(url).build());
                }
            }
        }
        if (request.getHealthFiles() != null) {
            for (MultipartFile file : request.getHealthFiles()) {
                String url = fileStorageService.storeFile(file, folder);
                if (url != null)
                    user.getAttachments().add(
                            UserAttachment.builder().user(user).docType(UserDocType.HEALTH_CHECK).fileUrl(url).build());
            }
        }
        if (request.getAvatarFile() != null) {
            String url = fileStorageService.storeFile(request.getAvatarFile(), folder);
            if (url != null) {
                // Remove old avatar if exists
                user.getAttachments().removeIf(att -> att.getDocType() == UserDocType.AVATAR);
                user.getAttachments().add(
                        UserAttachment.builder().user(user).docType(UserDocType.AVATAR).fileUrl(url).build());
            }
        }

        return mapToResponseDTO(userRepository.save(user));
    }

    // [Chức năng rõ ràng]: Phê duyệt KYC / Khóa tài khoản
    // [Tác dụng]: Cho phép Admin thay đổi trạng thái user (từ PENDING_KYC sang APPROVED, hoặc khóa tài khoản BANNED).
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Thêm điều kiện gửi email thông báo sau khi duyệt tài khoản thành công bên trong khối `if (status == UserStatus.APPROVED)`.
    @Override
    @Transactional
    public UserResponseDTO updateUserStatus(Integer id, UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + id));
        user.setStatus(status);

        // KỊCH BẢN: Nếu duyệt Khán giả thì tặng 100k khởi nghiệp
        if (status == UserStatus.APPROVED && user.getRole() == RoleEnum.SPECTATOR) {
            Wallet wallet = walletRepository.findByUserIdForUpdate(user.getId()).orElse(null);
            if (wallet != null && wallet.getBalance().compareTo(BigDecimal.ZERO) == 0) {
                // Kiểm tra xem đã từng nhận thưởng chưa bằng prefix transactionCode "BONUS-"
                boolean hasBonus = transactionHistoryRepository.findByWallet_UserIdOrderByCreatedAtDesc(user.getId())
                        .stream().anyMatch(t -> t.getTransactionCode() != null && t.getTransactionCode().startsWith("BONUS-"));
                
                if (!hasBonus) {
                    BigDecimal bonusAmount = new BigDecimal("100000.00");
                    wallet.setBalance(wallet.getBalance().add(bonusAmount));
                    walletRepository.save(wallet);

                    TransactionHistory tx = TransactionHistory.builder()
                            .transactionCode("BONUS-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                            .wallet(wallet)
                            .amount(bonusAmount)
                            .type(TransactionType.DEPOSIT)
                            .direction(TransactionDirection.IN)
                            .status(TransactionStatus.COMPLETED)
                                            .build();
                    transactionHistoryRepository.save(tx);
                }
            }
        }

        return mapToResponseDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy User với ID: " + id);
        }

        // Xóa Wallet và Lịch sử giao dịch trước để tránh lỗi Foreign Key
        walletRepository.findByUserId(id).ifPresent(wallet -> {
            java.util.List<TransactionHistory> txs = transactionHistoryRepository.findByWallet_UserIdOrderByCreatedAtDesc(id);
            if (!txs.isEmpty()) {
                transactionHistoryRepository.deleteAll(txs);
            }
            walletRepository.delete(wallet);
        });

        userRepository.deleteById(id);
    }

    private UserResponseDTO mapToResponseDTO(User user) {
        BigDecimal balance = walletRepository.findByUserId(user.getId())
                .map(w -> w.getBalance())
                .orElse(BigDecimal.ZERO);

        List<String> kycUrls = new ArrayList<>();
        List<String> certUrls = new ArrayList<>();
        List<String> healthUrls = new ArrayList<>();
        String avatarUrl = null;

        if (user.getAttachments() != null) {
            for (UserAttachment a : user.getAttachments()) {
                if (a.getDocType() == UserDocType.ID_CARD)
                    kycUrls.add(a.getFileUrl());
                if (a.getDocType() == UserDocType.JOCKEY_CERT || a.getDocType() == UserDocType.REFEREE_CERT)
                    certUrls.add(a.getFileUrl());
                if (a.getDocType() == UserDocType.HEALTH_CHECK)
                    healthUrls.add(a.getFileUrl());
                if (a.getDocType() == UserDocType.AVATAR)
                    avatarUrl = a.getFileUrl();
            }
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
                .kycDocumentUrls(kycUrls)
                .certDocumentUrls(certUrls)
                .healthDocumentUrls(healthUrls)
                .avatarUrl(avatarUrl)
                .weight(user.getWeight())
                .height(user.getHeight())
                .balance(balance)
                .banReason(user.getBanReason())
                .build();
    }

    @Override
    public List<BetHistoryResponseDTO> getMyBets(Integer userId) {
        return betRepository.findBySpectatorIdOrderByCreatedAtDesc(userId).stream()
                .map(bet -> BetHistoryResponseDTO.builder()
                        .id(bet.getId())
                        .raceName(bet.getRace().getName())
                        .horseName(bet.getRegistration().getHorse().getName())
                        .amount(bet.getAmount())
                        .expectedOdds(bet.getExpectedOdds())
                        .rewardAmount(bet.getStatus() == BetStatus.WON ? bet.getReward() : BigDecimal.ZERO)
                        .status(bet.getStatus())
                        .createdAt(bet.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<TransactionHistoryResponseDTO> getMyTransactions(Integer userId) {
        return transactionHistoryRepository.findByWallet_UserIdOrderByCreatedAtDesc(userId).stream()
                .map(tx -> TransactionHistoryResponseDTO.builder()
                        .transactionCode(tx.getTransactionCode())
                        .amount(tx.getAmount())
                        .type(tx.getType())
                        .direction(tx.getDirection())
                        .status(tx.getStatus())
                        .proofUrl(tx.getProofUrl())
                        .createdAt(tx.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<java.util.Map<String, Object>> getMyJockeyRewards(Integer userId) {
        List<Registration> regs = registrationRepository.findAll().stream()
                .filter(r -> r.getJockey() != null && r.getJockey().getId().equals(userId))
                .filter(r -> r.getRank() != null && r.getRank() <= 3)
                .filter(r -> r.getRace().getStatus() == com.swp.horseracing.model.RaceStatus.COMPLETED)
                .sorted((a, b) -> b.getRace().getRaceTime().compareTo(a.getRace().getRaceTime()))
                .collect(java.util.stream.Collectors.toList());

        List<java.util.Map<String, Object>> rewards = new java.util.ArrayList<>();
        for (Registration reg : regs) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", reg.getId());
            map.put("raceName", reg.getRace().getName());
            map.put("horseName", reg.getHorse().getName());
            map.put("rank", reg.getRank());
            map.put("date", reg.getRace().getRaceTime().toString());

            java.math.BigDecimal fixedPrize = java.math.BigDecimal.ZERO;
            if (reg.getRank() == 1 && reg.getRace().getPrize1() != null) fixedPrize = reg.getRace().getPrize1();
            if (reg.getRank() == 2 && reg.getRace().getPrize2() != null) fixedPrize = reg.getRace().getPrize2();
            if (reg.getRank() == 3 && reg.getRace().getPrize3() != null) fixedPrize = reg.getRace().getPrize3();
            
            java.math.BigDecimal jockeyFixed = fixedPrize.multiply(new java.math.BigDecimal("0.30")).setScale(2, java.math.RoundingMode.HALF_UP);
            java.math.BigDecimal jockeyPool = java.math.BigDecimal.ZERO;
            
            if (reg.getRank() == 1) {
                java.math.BigDecimal totalPool = betRepository.findByRaceId(reg.getRace().getId()).stream()
                        .map(com.swp.horseracing.model.Bet::getAmount)
                        .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                jockeyPool = totalPool.multiply(new java.math.BigDecimal("0.30")).setScale(2, java.math.RoundingMode.HALF_UP);
            }
            
            map.put("reward", jockeyFixed.add(jockeyPool));
            rewards.add(map);
        }
        return rewards;
    }
}