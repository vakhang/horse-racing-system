package com.swp.horseracing.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JockeyMarketResponseDTO {
    private Integer id;
    private String username;
    private Double weight;
    private Double height;
    private String phone;
    private String email;
    private String status; // SẴN SÀNG, ĐANG CÓ LỊCH, CHỜ DUYỆT
}
