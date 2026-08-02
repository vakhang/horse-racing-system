package com.swp.horseracing.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bets")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
    // [Chức năng rõ ràng]: Entity Vé cược
    // [Tác dụng]: Ánh xạ bảng `bets` trong CSDL. Lưu thông tin cá cược của Người chơi (Cược con ngựa nào, chặng nào, bao nhiêu tiền).
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm thuộc tính tỷ lệ cược (odds) tại thời điểm đặt, nếu không muốn tính toán động.
public class Bet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "spectator_id", referencedColumnName = "id", nullable = false)
    private User spectator;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "race_id")
    private Race race;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "registration_id")
    private Registration registration;

    private BigDecimal amount;
    
    // Tỷ lệ cược tạm tính tại thời điểm mua vé (Dùng cho Pari-Mutuel, chỉ mang tính chất tham khảo/kiểm toán)
    @Column(name = "expected_odds")
    private BigDecimal expectedOdds;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BetStatus status = BetStatus.PENDING;

    private BigDecimal reward; // THÊM TỪ DB: Tiền thưởng khi thắng

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}