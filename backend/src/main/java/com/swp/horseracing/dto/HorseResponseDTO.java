package com.swp.horseracing.dto;

import com.swp.horseracing.model.HorseStatus;
import lombok.Builder;
import lombok.Data;
import java.util.List;

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

    // Mảng tài liệu thay vì String đơn
    private List<String> certDocumentUrls;
    private List<String> realImageUrls;
    private List<String> vetRecordUrls;

    private HorseStatus status;
    private Integer totalRaces;
    private Integer winRaces;
    private Float winRate;
    private String healthStatus;
}