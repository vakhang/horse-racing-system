package com.swp.horseracing.dto;

import com.swp.horseracing.model.AnnouncementCategory;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SystemAnnouncementDTO {
    private Integer id;
    private String content;
    private AnnouncementCategory category;
    private String attachmentUrl;
    private String targetRoles;
    private String targetStatuses;
    private Integer createdBy;
    private String adminIp;
    private Integer successCount;
    private LocalDateTime createdAt;
}
