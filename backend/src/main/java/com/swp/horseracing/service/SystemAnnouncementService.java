package com.swp.horseracing.service;

import com.swp.horseracing.dto.SystemAnnouncementDTO;
import com.swp.horseracing.model.AnnouncementCategory;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

    // [Chức năng rõ ràng]: Interface Service Thông báo
    // [Tác dụng]: Định nghĩa hàm tạo và lấy danh sách thông báo.
    // [Hướng dẫn sửa đổi]:
    // - Logic: Thêm hàm gửi thông báo qua Email.
public interface SystemAnnouncementService {
    SystemAnnouncementDTO createAnnouncement(
            String content,
            AnnouncementCategory category,
            List<String> targetRoles,
            List<String> targetStatuses,
            MultipartFile file,
            Integer adminId,
            String adminIp
    );

    List<SystemAnnouncementDTO> getAllAnnouncements();
}
