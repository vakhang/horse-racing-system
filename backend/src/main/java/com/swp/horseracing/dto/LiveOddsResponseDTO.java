package com.swp.horseracing.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class LiveOddsResponseDTO {
    private Integer registrationId;
    private String horseName;
    private BigDecimal totalBetOnHorse; // Tổng tiền cược riêng cho con ngựa này
    private BigDecimal calculatedOdds;   // Tỷ lệ cược dự kiến (Real-time) trả về cho FE
    private String status;
    private String note;
}