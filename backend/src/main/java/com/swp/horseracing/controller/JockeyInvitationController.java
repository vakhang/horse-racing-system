package com.swp.horseracing.controller;

import com.swp.horseracing.dto.InvitationRequestDTO;
import com.swp.horseracing.service.JockeyInvitationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class JockeyInvitationController {

    private final JockeyInvitationService invitationService;

    // [Chức năng rõ ràng]: API Tạo lời mời Nài ngựa
    // [Tác dụng]: Nhận request từ Chủ Ngựa gửi lời mời thuê Nài ngựa lái con ngựa của mình trong 1 chặng đua cụ thể.
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Đổi endpoint bằng cách sửa `@PostMapping`.
    @PostMapping
    public ResponseEntity<?> createInvitation(@RequestBody InvitationRequestDTO request) {
        try {
            return ResponseEntity.ok(invitationService.createInvitation(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptInvitation(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(invitationService.acceptInvitation(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectInvitation(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(invitationService.rejectInvitation(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
    // [Chức năng rõ ràng]: API Lấy danh sách Lời mời
    // [Tác dụng]: Dùng chung cho cả Chủ Ngựa (xem lời mời đã gửi) và Nài Ngựa (xem lời mời nhận được). Dựa vào biến truyền lên là `jockeyId` hay `ownerId`.
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Nếu muốn đổi cách lọc, chỉnh sửa các tham số `@RequestParam` bên dưới.
    @GetMapping
    public ResponseEntity<?> getInvitations(
            @RequestParam(required = false) Integer jockeyId,
            @RequestParam(required = false) Integer ownerId) {
        try {
            if (jockeyId != null) {
                return ResponseEntity.ok(invitationService.getInvitationsByJockeyId(jockeyId));
            } else if (ownerId != null) {
                return ResponseEntity.ok(invitationService.getInvitationsByOwnerId(ownerId));
            }
            return ResponseEntity.badRequest().body("Phải cung cấp jockeyId hoặc ownerId");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelInvitation(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(invitationService.cancelInvitation(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}