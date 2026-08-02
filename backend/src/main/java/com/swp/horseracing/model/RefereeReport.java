package com.swp.horseracing.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "referee_reports")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
    // [Chức năng rõ ràng]: Entity Báo cáo Trọng tài
    // [Tác dụng]: Ánh xạ bảng `referee_reports`. Lưu vết báo cáo kết quả và các vi phạm (nếu có) do Trọng tài ghi nhận.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm cột URL chứa hình ảnh/video bằng chứng (Evidence).
public class RefereeReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "race_id", referencedColumnName = "id", nullable = false)
    private Race race;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "registration_id", referencedColumnName = "id", nullable = false)
    private Registration registration; // Đổi violator_id thành registration_id theo DB

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "referee_id", referencedColumnName = "id", nullable = false)
    private User referee;

    @Column(name = "violation_details", columnDefinition = "TEXT")
    private String violationDetails; // Đổi description thành violationDetails

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}