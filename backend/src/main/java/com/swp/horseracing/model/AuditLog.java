package com.swp.horseracing.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "action", nullable = false)
    private String action; // VD: CANCEL_TOURNAMENT, POSTPONE_TOURNAMENT, WITHDRAW_HORSE

    @Column(name = "performed_by")
    private String performedBy;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason; // Bắt buộc lưu lý do theo chuẩn Audit pháp lý

    @Column(name = "entity_name")
    private String entityName;

    @Column(name = "entity_id")
    private String entityId;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "affected_bets_count")
    private Integer affectedBetsCount; // Số lượng vé cược bị ảnh hưởng

    @Column(name = "total_refund_amount")
    private BigDecimal totalRefundAmount; // Tổng tiền đã auto-refund

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}