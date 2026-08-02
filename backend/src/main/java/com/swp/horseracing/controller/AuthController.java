package com.swp.horseracing.controller;

import com.swp.horseracing.dto.LoginRequestDTO;
import com.swp.horseracing.dto.RegisterRequestDTO;
import com.swp.horseracing.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    // [Chức năng rõ ràng]: API Đăng ký tài khoản (Register)
    // [Tác dụng]: Nhận request từ Frontend (bao gồm thông tin text và ảnh đại diện/CMND qua dạng Multipart form) để tạo tài khoản mới.
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Đổi đường dẫn API ở `@PostMapping("/register")`.
    @PostMapping(value = "/register", consumes = "multipart/form-data")
    public ResponseEntity<?> register(@ModelAttribute RegisterRequestDTO request) {
        try {
            return ResponseEntity.ok(userService.registerUser(request));
        } catch (RuntimeException e) {
            // FIX: Trả về chuẩn JSON để Frontend đọc được biến error
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO request) {
        try {
            return ResponseEntity.ok(userService.loginUser(request));
        } catch (RuntimeException e) {
            // FIX: Trả về chuẩn JSON
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
