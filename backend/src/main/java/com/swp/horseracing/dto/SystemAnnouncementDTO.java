package com.swp.horseracing.dto;

import com.swp.horseracing.model.AnnouncementCategory;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
    // [Chức năng rõ ràng]: Lớp DTO trả về Thông báo Hệ thống
    // [Tác dụng]: Đóng gói các thông báo chung từ Admin (như bảo trì, sự kiện) để hiển thị lên bảng tin người dùng.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm thuộc tính cờ (isRead) để biết User đã đọc hay chưa.
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
