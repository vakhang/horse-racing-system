package com.swp.horseracing.dto;

import com.swp.horseracing.model.RegistrationStatus;
import lombok.Data;

@Data
public class RegistrationRequestDTO {
    private Integer raceId;
    private Integer horseId;
    private Integer ownerId;
    private Integer jockeyId;
    private RegistrationStatus status;
    private String note;
    private java.math.BigDecimal odds;
    private java.util.List<org.springframework.web.multipart.MultipartFile> kycFiles;
    private String reason; // Phục vụ lưu Nhật ký khi Ngựa bị đánh rớt (WITHDRAWN)
}