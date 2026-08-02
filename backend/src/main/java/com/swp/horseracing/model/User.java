package com.swp.horseracing.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
    // [Chức năng rõ ràng]: Entity Người dùng
    // [Tác dụng]: Ánh xạ bảng `users`. Chứa thông tin đăng nhập và Profile cơ bản của mọi tài khoản.
    // [Hướng dẫn sửa đổi]:
    // - Data: Có thể thiết lập thêm quan hệ One-to-One tới bảng `Settings` nếu User muốn tùy chỉnh UI.
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String username;
    private String password;
    private String email;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "id_number")
    private String idNumber;

    @Column(name = "id_issue_date")
    private LocalDate idIssueDate;

    @Column(name = "id_issue_place")
    private String idIssuePlace;

    @Column(name = "pin_code")
    private String pinCode;

    // --- CÁC TRƯỜNG ĐỒNG Ý ĐIỀU KHOẢN PHÁP LÝ ---
    @Column(name = "agreed_rule_1")
    private Boolean agreedRule1;

    @Column(name = "agreed_rule_2")
    private Boolean agreedRule2;

    @Column(name = "agreed_rule_3")
    private Boolean agreedRule3;

    @Column(name = "agreed_rule_4")
    private Boolean agreedRule4;
    // -------------------------------------------

    @Enumerated(EnumType.STRING)
    private RoleEnum role;

    private LocalDate dob;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    @Column(name = "ban_reason", columnDefinition = "TEXT")
    private String banReason;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "failed_attempts")
    private Integer failedAttempts;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    private Double weight;
    private Double height;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<UserAttachment> attachments = new java.util.ArrayList<>();
}
