package com.swp.horseracing.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity

@Table(name = "registrations", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"race_id", "horse_id"}),
        @UniqueConstraint(columnNames = {"race_id", "jockey_id"})
})
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "race_id", referencedColumnName = "id")
    private Race race;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "horse_id", referencedColumnName = "id")
    private Horse horse;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", referencedColumnName = "id")
    private User owner;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "jockey_id", referencedColumnName = "id")
    private User jockey;



    @Enumerated(EnumType.STRING)
    private RegistrationStatus status;

    private String note;
    private java.math.BigDecimal odds;
    
    @Column(name = "rank")
    private Integer rank;
}