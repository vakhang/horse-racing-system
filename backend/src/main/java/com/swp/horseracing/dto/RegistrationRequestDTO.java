package com.swp.horseracing.dto;

import com.swp.horseracing.model.RegistrationStatus;
import lombok.Data;

@Data
    // [Chức năng rõ ràng]: Lớp DTO nhận Request Đăng ký Đua
    // [Tác dụng]: Hứng dữ liệu khi Chủ/Nài ngựa chốt danh sách thi đấu (bao gồm ngựa nào, nài nào chạy trong chặng nào).
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm lệ phí thi đấu nếu có thu phí tham gia.
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