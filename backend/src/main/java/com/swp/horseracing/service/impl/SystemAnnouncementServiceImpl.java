package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.SystemAnnouncementDTO;
import com.swp.horseracing.model.AnnouncementCategory;
import com.swp.horseracing.model.SystemAnnouncement;
import com.swp.horseracing.repository.SystemAnnouncementRepository;
import com.swp.horseracing.repository.UserRepository;
import com.swp.horseracing.service.FileStorageService;
import com.swp.horseracing.service.SystemAnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
    // [Chức năng rõ ràng]: Class Triển khai Thông báo
    // [Tác dụng]: Lưu text và file đính kèm (nếu có) thành một thông báo public, hiển thị trên trang chủ.
    // [Hướng dẫn sửa đổi]:
    // - Logic: Cập nhật hàm này để kết nối với Web Socket / Firebase nếu muốn Push Notification Realtime.
public class SystemAnnouncementServiceImpl implements SystemAnnouncementService {

    private final SystemAnnouncementRepository announcementRepository;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public SystemAnnouncementDTO createAnnouncement(
            String content,
            AnnouncementCategory category,
            List<String> targetRoles,
            List<String> targetStatuses,
            MultipartFile file,
            Integer adminId,
            String adminIp) {

        String attachmentUrl = null;
        if (file != null && !file.isEmpty()) {
            attachmentUrl = fileStorageService.storeFile(file, "announcements");
        }

        String rolesStr = (targetRoles != null && !targetRoles.isEmpty()) ? String.join(",", targetRoles) : null;
        String statusesStr = (targetStatuses != null && !targetStatuses.isEmpty()) ? String.join(",", targetStatuses) : null;

        // Ước tính số lượng người dùng sẽ nhận được (Thực tế phức tạp hơn nhưng ở đây đếm đơn giản hoặc giả lập)
        // Vì yêu cầu chỉ đếm số lượng tài khoản đã nhận, ta sẽ dùng hàm đếm tổng quát hoặc tạm giả lập nếu chưa có query phức tạp.
        int successCount = (int) userRepository.count(); // Tạm lấy tổng user, bạn có thể custom query đếm theo role/status.

        SystemAnnouncement announcement = SystemAnnouncement.builder()
                .content(content)
                .category(category)
                .attachmentUrl(attachmentUrl)
                .targetRoles(rolesStr)
                .targetStatuses(statusesStr)
                .createdBy(adminId)
                .adminIp(adminIp)
                .successCount(successCount)
                .createdAt(LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")))
                .build();

        SystemAnnouncement saved = announcementRepository.save(announcement);
        return mapToDTO(saved);
    }

    @Override
    public List<SystemAnnouncementDTO> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private SystemAnnouncementDTO mapToDTO(SystemAnnouncement entity) {
        return SystemAnnouncementDTO.builder()
                .id(entity.getId())
                .content(entity.getContent())
                .category(entity.getCategory())
                .attachmentUrl(entity.getAttachmentUrl())
                .targetRoles(entity.getTargetRoles())
                .targetStatuses(entity.getTargetStatuses())
                .createdBy(entity.getCreatedBy())
                .adminIp(entity.getAdminIp())
                .successCount(entity.getSuccessCount())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
