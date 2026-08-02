package com.swp.horseracing.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "horse_attachments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
    // [Chức năng rõ ràng]: Entity Tài liệu Ngựa
    // [Tác dụng]: Ánh xạ bảng `horse_attachments`, lưu trữ URL ảnh, giấy khai sinh, hồ sơ thú y của Ngựa.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm cột `fileName` nếu muốn lưu cả tên file gốc do người dùng tải lên.
public class HorseAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "horse_id")
    private Horse horse;

    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", length = 50)
    private HorseDocType docType;

    @Column(name = "file_url", columnDefinition = "TEXT")
    private String fileUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}