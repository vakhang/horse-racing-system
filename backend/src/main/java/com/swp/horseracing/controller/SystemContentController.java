package com.swp.horseracing.controller;

import com.swp.horseracing.dto.SystemContentDTO;
import com.swp.horseracing.service.SystemContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SystemContentController {

    private final SystemContentService systemContentService;

    // [Chức năng rõ ràng]: API Lấy bài viết (Public)
    // [Tác dụng]: Cho phép Frontend (dù người dùng chưa đăng nhập) lấy nội dung HTML của các bài viết (như Giới thiệu, Luật chơi) để hiển thị lên màn hình.
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Nếu đổi endpoint API lấy bài viết, hãy sửa `@GetMapping("/public/content/{pageId}")`. Đảm bảo URL này đã được `permitAll` trong `SecurityConfig.java`.
    @GetMapping("/public/content/{pageId}")
    public ResponseEntity<?> getPublicContent(@PathVariable String pageId) {
        try {
            return ResponseEntity.ok(systemContentService.getContentByPageId(pageId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // Admin API for fetching all content meta
    @GetMapping("/admin/content")
    public ResponseEntity<?> getAllContents() {
        try {
            return ResponseEntity.ok(systemContentService.getAllContents());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // Admin API for updating content
    @PutMapping("/admin/content/{pageId}")
    public ResponseEntity<?> updateContent(@PathVariable String pageId, @RequestBody SystemContentDTO request) {
        try {
            return ResponseEntity.ok(systemContentService.updateContent(pageId, request));
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
