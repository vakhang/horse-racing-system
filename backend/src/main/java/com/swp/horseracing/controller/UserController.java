package com.swp.horseracing.controller;

import com.swp.horseracing.dto.UserResponseDTO;
import com.swp.horseracing.dto.UserUpdateRequestDTO;
import com.swp.horseracing.model.UserStatus;
import com.swp.horseracing.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Lấy danh sách tất cả Users (Dành cho Admin)
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Lấy thông tin 1 User theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(userService.getUserById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API CẬP NHẬT FULL THÔNG TIN (Hỗ trợ upload file)
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @ModelAttribute UserUpdateRequestDTO request) {
        try {
            return ResponseEntity.ok(userService.updateUser(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API CHUYÊN BIỆT CHO ADMIN DUYỆT/KHÓA TÀI KHOẢN (Chỉ nhận JSON)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        try {
            UserStatus status = UserStatus.valueOf(body.get("status"));
            return ResponseEntity.ok(userService.updateUserStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Xóa User
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("Xóa User thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Lịch sử Cược
    @GetMapping("/my-bets")
    public ResponseEntity<?> getMyBets(@RequestParam Integer userId) {
        try {
            return ResponseEntity.ok(userService.getMyBets(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Lịch sử Giao dịch
    @GetMapping("/my-transactions")
    public ResponseEntity<?> getMyTransactions(@RequestParam Integer userId) {
        try {
            return ResponseEntity.ok(userService.getMyTransactions(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}