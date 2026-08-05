package com.swp.horseracing.model;

import jakarta.persistence.*;
import lombok.*;

@Entity

@Table(name = "registrations", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"race_id", "horse_id"}),
        @UniqueConstraint(columnNames = {"race_id", "jockey_id"})
})
@Data @NoArgsConstructor @AllArgsConstructor @Builder
    // [Chức năng rõ ràng]: Entity Đơn đăng ký tham gia Chặng đua
    // [Tác dụng]: Ánh xạ bảng `registrations`. Lưu thông tin 1 suất thi đấu gồm: Chặng đua + Ngựa + Nài ngựa + Số báo danh.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm cột `Final Rank` (Thứ hạng chung cuộc) để lưu trữ kết quả cuối cùng.
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "race_id", referencedColumnName = "id")
    private Race race;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "horse_id", referencedColumnName = "id")
    private Horse horse;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", referencedColumnName = "id")
    private User owner;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "jockey_id", referencedColumnName = "id")
    private User jockey;



    @Enumerated(EnumType.STRING)
    private RegistrationStatus status;

    private String note;
    private java.math.BigDecimal odds;
    
    @Column(name = "rank")
    private Integer rank;


    @jakarta.persistence.Column(name = "assigned_weight")
    private Double assignedWeight;

    @jakarta.persistence.Column(name = "actual_weight")
    private Double actualWeight;

    @jakarta.persistence.Column(name = "lead_weight")
    private Double leadWeight;

    @jakarta.persistence.Column(name = "is_weighed_in")
    @lombok.Builder.Default
    private Boolean isWeighedIn = false;

    @jakarta.persistence.Column(name = "gate_number")
    private Integer gateNumber;

}