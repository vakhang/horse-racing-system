package com.swp.horseracing.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_announcements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemAnnouncement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AnnouncementCategory category;

    @Column(name = "attachment_url", columnDefinition = "TEXT")
    private String attachmentUrl;

    @Column(name = "target_roles")
    private String targetRoles;

    @Column(name = "target_statuses")
    private String targetStatuses;

    @Column(name = "created_by", nullable = false)
    private Integer createdBy;

    @Column(name = "admin_ip", length = 50)
    private String adminIp;

    @Column(name = "success_count")
    private Integer successCount;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
