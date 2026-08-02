package com.swp.horseracing.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "jockey_invitations")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
    // [Chức năng rõ ràng]: Entity Lời mời Nài ngựa
    // [Tác dụng]: Ánh xạ bảng `jockey_invitations`. Lưu trữ yêu cầu thuê Nài ngựa của Chủ ngựa cho một chặng đua cụ thể.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm cột giá thỏa thuận (Deal Price) nếu hệ thống cho phép thương lượng thù lao.
public class JockeyInvitation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "registration_id", referencedColumnName = "id")
    private Registration registration;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "jockey_id", referencedColumnName = "id")
    private User jockey;

    @Enumerated(EnumType.STRING)
    private InvitationStatus status;

    @CreationTimestamp
    @Column(name = "invited_at", updatable = false)
    private LocalDateTime invitedAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;
}