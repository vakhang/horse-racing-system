package com.swp.horseracing.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "races")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
    // [Chức năng rõ ràng]: Entity Chặng đua
    // [Tác dụng]: Ánh xạ bảng `races`. Quản lý thông tin một chặng đua cụ thể (Ngày giờ, khoảng cách, trạng thái) thuộc về một Giải đấu.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm thuộc tính về điều kiện thời tiết (Weather) hoặc độ ẩm đường đua.
public class Race {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", referencedColumnName = "id")
    private Tournament tournament;

    private String name;

    @Column(name = "race_time")
    private LocalDateTime raceTime;

    @Column(name = "total_pool")
    @Builder.Default
    private BigDecimal totalPool = BigDecimal.ZERO;

    @Column(name = "rake_percentage")
    @Builder.Default
    private BigDecimal rakePercentage = new BigDecimal("20.00");

    @Enumerated(EnumType.STRING)
    private RaceStatus status;

    @Column(name = "estimated_duration")
    @Builder.Default
    private Integer estimatedDuration = 30; // Phút

    // --- CÁC THUỘC TÍNH MỚI BỔ SUNG ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referee_id", referencedColumnName = "id")
    private User referee;

    private BigDecimal prize1;
    private BigDecimal prize2;
    private BigDecimal prize3;

    @Column(name = "race_class")
    private Integer raceClass; // Hạng/Class quy định của chặng đua (Ví dụ: Class 1, 2, 3, 4, 5)

    @PrePersist
    public void prePersist() {
        if (this.status == null) {
            this.status = RaceStatus.REGISTRATION;
        }
    }


    @jakarta.persistence.Column(name = "minus_pool_deficit", precision = 15, scale = 2)
    @lombok.Builder.Default
    private java.math.BigDecimal minusPoolDeficit = java.math.BigDecimal.ZERO;

}