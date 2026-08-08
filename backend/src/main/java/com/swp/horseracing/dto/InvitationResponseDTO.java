package com.swp.horseracing.dto;

import com.swp.horseracing.model.InvitationStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
    // [Chức năng rõ ràng]: Lớp DTO trả về Thông tin Lời mời
    // [Tác dụng]: Đóng gói thông tin hiển thị danh sách lời mời (dành cho màn hình của Nài ngựa và Chủ ngựa).
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm trường dữ liệu nếu UI cần hiển thị thời gian gửi lời mời.
public class InvitationResponseDTO {
    private Integer id;
    private Integer registrationId;
    private String tournamentName;
    private String raceName;
    private String horseName;
    private Integer jockeyId;
    private String jockeyUsername;
    private InvitationStatus status;
    private LocalDateTime invitedAt;
    private LocalDateTime respondedAt;
}