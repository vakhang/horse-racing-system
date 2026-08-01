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

    // Public API for visitors
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
