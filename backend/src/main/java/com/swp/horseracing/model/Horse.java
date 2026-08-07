package com.swp.horseracing.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "horses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
    // [Chức năng rõ ràng]: Entity Ngựa
    // [Tác dụng]: Ánh xạ bảng `horses` trong CSDL. Quản lý thông tin cốt lõi của một chú ngựa (Chủ sở hữu, tuổi, giống, trạng thái).
    // [Hướng dẫn sửa đổi]:
    // - Data: Sửa/Thêm thuộc tính nếu cần lưu trữ thêm các thông số y tế hoặc lịch sử chấn thương.
public class Horse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", referencedColumnName = "id")
    private User owner;

    private Integer age;
    private String breed;
    private String color;

    @OneToMany(mappedBy = "horse", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<HorseAttachment> attachments = new java.util.ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private HorseStatus status;

    // --- CÁC TRƯỜNG MỚI ĐỂ ADMIN QUẢN LÝ ---
    @Column(name = "total_races")
    @Builder.Default
    private Integer totalRaces = 0;

    @Column(name = "win_races")
    @Builder.Default
    private Integer winRaces = 0;

    @Column(name = "health_status")
    @Builder.Default
    private String healthStatus = "READY"; // Sẵn sàng (READY) hoặc Chấn thương (INJURED)

    @Column(name = "microchip_code")
    private String microchipCode;

    @Column(name = "last_health_check")
    private LocalDateTime lastHealthCheck;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;


    @jakarta.persistence.Column(name = "rating")
    @lombok.Builder.Default
    private Integer rating = 60;

    @jakarta.persistence.Column(name = "class_level")
    @lombok.Builder.Default
    private Integer classLevel = 3;

}
