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
}
