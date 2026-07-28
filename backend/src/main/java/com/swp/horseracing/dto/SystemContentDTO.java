package com.swp.horseracing.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SystemContentDTO {
    private Integer id;
    private String pageId;
    private String title;
    private String content;
    private LocalDateTime updatedAt;
}
