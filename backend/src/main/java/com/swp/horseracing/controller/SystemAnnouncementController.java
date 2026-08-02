package com.swp.horseracing.controller;

import com.swp.horseracing.dto.SystemAnnouncementDTO;
import com.swp.horseracing.model.AnnouncementCategory;
import com.swp.horseracing.security.JwtUtils;
import com.swp.horseracing.service.SystemAnnouncementService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/announcements")
@RequiredArgsConstructor
public class SystemAnnouncementController {

    private final SystemAnnouncementService announcementService;
    private final JwtUtils jwtUtils;

    // [Chức năng rõ ràng]: API Tạo thông báo hệ thống (Admin)
    // [Tác dụng]: Nhận request từ Admin (gồm nội dung, ảnh đính kèm, đối tượng nhận) để phát thông báo tới tất cả user.
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Có thể bỏ đoạn `MultipartFile file` nếu không muốn cho admin gửi kèm ảnh.
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createAnnouncement(
            @RequestParam("content") String content,
            @RequestParam("category") String categoryStr,
            @RequestParam(value = "targetRoles", required = false) List<String> targetRoles,
            @RequestParam(value = "targetStatuses", required = false) List<String> targetStatuses,
            @RequestParam(value = "file", required = false) MultipartFile file,
            HttpServletRequest request) {

        try {
            AnnouncementCategory category = AnnouncementCategory.valueOf(categoryStr);
            String token = extractToken(request);
            if (token == null)
                return ResponseEntity.status(401).body("Unauthorized");

            Integer adminId = jwtUtils.getUserIdFromToken(token);
            String adminIp = request.getRemoteAddr();

            SystemAnnouncementDTO result = announcementService.createAnnouncement(
                    content, category, targetRoles, targetStatuses, file, adminId, adminIp);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<SystemAnnouncementDTO>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementService.getAllAnnouncements());
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
