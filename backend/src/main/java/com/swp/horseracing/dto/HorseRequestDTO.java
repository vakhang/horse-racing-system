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
    private HorseStatus status;
    private java.util.List<org.springframework.web.multipart.MultipartFile> certFiles;
    private java.util.List<org.springframework.web.multipart.MultipartFile> realImageFiles;
    private java.util.List<org.springframework.web.multipart.MultipartFile> vetRecordFiles;
}