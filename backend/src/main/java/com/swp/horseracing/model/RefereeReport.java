package com.swp.horseracing.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "referee_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefereeReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "race_id", referencedColumnName = "id", nullable = false)
    private Race race;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "referee_id", referencedColumnName = "id", nullable = false)
    private User referee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "violator_id", referencedColumnName = "id")
    private User violator; // Có thể null nếu vi phạm không xác định rõ

    @Column(nullable = false, length = 1000)
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
