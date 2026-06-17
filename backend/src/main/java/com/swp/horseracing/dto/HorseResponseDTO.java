package com.swp.horseracing.dto;

import com.swp.horseracing.model.HorseStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HorseResponseDTO {
    private Integer id;
    private String name;
    private Integer ownerId;
    private String ownerUsername;
    private Integer age;
    private String breed;
    private String color;
    private String documentUrl;
    private HorseStatus status;

    private Integer totalRaces;
    private Integer winRaces;
    private Float winRate; // Tính bằng %
    private String healthStatus;
}