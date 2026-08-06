package com.swp.horseracing.dto;

import com.swp.horseracing.model.RegistrationStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
    // [Chức năng rõ ràng]: Lớp DTO trả về Thông tin Đăng ký Đua
    // [Tác dụng]: Trả về chi tiết một suất thi đấu (Ai cưỡi, ngựa gì, ở làn chạy số mấy).
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm thông tin tỷ lệ cược cá nhân cho từng suất chạy này.
public class RegistrationResponseDTO {
    private Integer id;
    private Integer raceId;
    private String raceName;
    private Integer horseId;
    private String horseName;
    private Integer ownerId;
    private String ownerUsername;
    private Integer jockeyId;
    private String jockeyUsername;
    private RegistrationStatus status;
    private String note;
    private Integer finishPosition;
    private Integer gateNumber;
}