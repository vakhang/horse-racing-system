package com.swp.horseracing.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tournaments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
    // [Chức năng rõ ràng]: Entity Giải đấu
    // [Tác dụng]: Ánh xạ bảng `tournaments`. Lưu thông tin tổng quan của một Giải đấu lớn (bao gồm nhiều Chặng đua).
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm Logo hoặc Banner URL cho giải đấu.
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private TournamentStatus status;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;


    @jakarta.persistence.Column(name = "required_class")
    private Integer requiredClass;

}