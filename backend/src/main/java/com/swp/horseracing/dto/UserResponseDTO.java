package com.swp.horseracing.dto;

import com.swp.horseracing.model.RoleEnum;
import com.swp.horseracing.model.UserStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
    // [Chức năng rõ ràng]: Lớp DTO trả về Thông tin User
    // [Tác dụng]: Đóng gói Profile của User (sau khi ẩn password) để gửi về Frontend.
    // [Hướng dẫn sửa đổi]:
    // - Data: Cần lọc cẩn thận, không bao giờ thêm các trường nhạy cảm như `password` hay `token` vào class này.
public class UserResponseDTO {
    private Integer id;
    private String username;
    private String email;
    private RoleEnum role;
    private LocalDate dob;
    private String phoneNumber;
    private UserStatus status;
    private LocalDateTime createdAt;
    private String token;
    private String banReason;

    // Bổ sung danh sách mảng link (để hứng nhiều file)
    private List<String> kycDocumentUrls;
    private List<String> certDocumentUrls;
    private List<String> healthDocumentUrls;
    private String avatarUrl;

    private Double weight;
    private Double height;
    private BigDecimal balance;
}