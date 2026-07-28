package com.swp.horseracing.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemContentDTO {
    private Integer id;
    private String pageId;
    private String title;
    private String content;
    private LocalDateTime updatedAt;
}
