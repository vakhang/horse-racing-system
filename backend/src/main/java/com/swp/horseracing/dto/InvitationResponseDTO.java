package com.swp.horseracing.dto;

import com.swp.horseracing.model.InvitationStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class InvitationResponseDTO {
    private Integer id;
    private Integer registrationId;
    private String raceName;
    private String horseName;
    private Integer jockeyId;
    private String jockeyUsername;
    private InvitationStatus status;
    private LocalDateTime invitedAt;
    private LocalDateTime respondedAt;
}