package com.swp.horseracing.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "prize_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
    // [Chức năng rõ ràng]: Entity Cấu hình Giải thưởng
    // [Tác dụng]: Ánh xạ bảng `prize_configs`. Lưu tỷ lệ chia tiền thưởng cho Hạng 1, 2, 3 và % phí nền tảng.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm thuộc tính nếu chia thưởng cho cả Hạng 4 hoặc Hạng 5.
public class PrizeConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "horse_owner_percentage", nullable = false)
    @Builder.Default
    private BigDecimal horseOwnerPercentage = new BigDecimal("0.05");

    @Column(name = "jockey_percentage", nullable = false)
    @Builder.Default
    private BigDecimal jockeyPercentage = new BigDecimal("0.02");

    @Column(name = "jackpot_pool", nullable = false)
    @Builder.Default
    private BigDecimal jackpotPool = BigDecimal.ZERO;
}
