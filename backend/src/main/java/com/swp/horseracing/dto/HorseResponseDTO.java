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
    private String ownerUsername; // Tiện cho FE hiển thị tên chủ ngựa
    private Integer age;
    private String breed;
    private String color;
    private Float winRate;
    private String documentUrl;
    private HorseStatus status;
}