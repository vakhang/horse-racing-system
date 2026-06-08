package com.swp.horseracing.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "referee_reports")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
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