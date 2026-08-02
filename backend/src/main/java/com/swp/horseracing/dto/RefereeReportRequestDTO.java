package com.swp.horseracing.dto;

import lombok.Data;

@Data
    // [Chức năng rõ ràng]: Lớp DTO nhận Request Báo cáo Trọng tài
    // [Tác dụng]: Hứng nội dung text báo cáo sự cố/vi phạm từ Trọng tài gửi lên Admin.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm thuộc tính ảnh minh họa vi phạm (nếu cần).
public class RefereeReportRequestDTO {
    private Integer raceId;
    private Integer refereeId;
    private Integer registrationId; // Đổi từ violatorId
    private String violationDetails; // Đổi từ description
}