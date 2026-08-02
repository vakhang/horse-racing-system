package com.swp.horseracing.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_attachments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
    // [Chức năng rõ ràng]: Entity Tài liệu Người dùng
    // [Tác dụng]: Ánh xạ bảng `user_attachments`. Lưu ảnh Avatar và hình CCCD của User phục vụ mục đích KYC.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm cột trạng thái Duyệt (Approved/Rejected) riêng cho từng ảnh nếu muốn.
public class UserAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", length = 50)
    private UserDocType docType;

    @Column(name = "file_url", columnDefinition = "TEXT")
    private String fileUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}