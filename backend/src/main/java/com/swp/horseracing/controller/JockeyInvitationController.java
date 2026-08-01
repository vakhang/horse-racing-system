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
    // API LẤY DANH SÁCH LỜI MỜI CHO NÀI NGỰA HOẶC CHỦ NGỰA
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