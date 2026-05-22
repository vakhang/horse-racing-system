package com.swp.horseracing.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "horses")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Horse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    // Quan hệ N-1: Nhiều con ngựa thuộc về 1 Chủ ngựa (User)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", referencedColumnName = "id")
    private User owner;

    private Integer age;

    @Column(name = "health_status")
    private String healthStatus;

    @Column(name = "win_rate")
    private Float winRate;

    @Column(name = "document_url", columnDefinition = "TEXT")
    private String documentUrl;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private HorseStatus status;
}