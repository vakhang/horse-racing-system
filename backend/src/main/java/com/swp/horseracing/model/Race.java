package com.swp.horseracing.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "races")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Race {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Thiết lập mối quan hệ N-1 với bảng Tournaments
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tournament_id", referencedColumnName = "id")
    private Tournament tournament;

    private String name;

    @Column(name = "race_time")
    private LocalDateTime raceTime;
    @Column(name = "total_pool")
    private BigDecimal totalPool = BigDecimal.ZERO; // Tổng tiền quỹ

    @Column(name = "rake_percentage")
    private BigDecimal rakePercentage = new BigDecimal("20.00"); // 20% cắt phế nhà cái
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private RaceStatus status;
}