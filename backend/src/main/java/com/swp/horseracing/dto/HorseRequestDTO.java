package com.swp.horseracing.dto;

import com.swp.horseracing.model.HorseStatus;
import lombok.Data;

@Data
public class HorseRequestDTO {
    private String name;
    private Integer ownerId; // Bắt buộc để biết ngựa của ai
    private Integer age;
    private String breed;
    private String color;
    private String documentUrl;
    private HorseStatus status;
}