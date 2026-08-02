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
import com.swp.horseracing.repository.UserRepository;
import com.swp.horseracing.model.User;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    // [Chức năng rõ ràng]: API Lấy danh sách Users (Cho Admin)
    // [Tác dụng]: Trả về danh sách tất cả người dùng trong hệ thống (gồm cả Người chơi, Chủ ngựa, Nài ngựa) để Admin quản lý.
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Có thể thêm các biến truyền vào `@GetMapping` để hỗ trợ lọc theo Role nếu cần (VD: `?role=OWNER`).
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // LẤY DANH SÁCH NÀI NGỰA TRÊN SÀN GIAO DỊCH
    @GetMapping("/jockeys/market")
    public ResponseEntity<?> getJockeyMarket() {
        try {
            return ResponseEntity.ok(userService.getJockeyMarket());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // Lấy thông tin 1 User theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(userService.getUserById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // API CẬP NHẬT FULL THÔNG TIN (Hỗ trợ upload file)
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @ModelAttribute UserUpdateRequestDTO request) {
        try {
            return ResponseEntity.ok(userService.updateUser(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // [Chức năng rõ ràng]: API Đổi trạng thái Tài Khoản
    // [Tác dụng]: Admin gọi API này để Duyệt (APPROVED), Từ chối (REJECTED), hoặc Khóa (BANNED) tài khoản.
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Đổi endpoint ở `@PutMapping("/{id}/status")`. Chỉ nhận tham số JSON là `status`.
    @PutMapping("/{id}/status")
    public ResponseEntity<UserResponseDTO> updateUserStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        String newStatusStr = body.get("status");
        if (newStatusStr == null) {
            return ResponseEntity.badRequest().build();
        }
        UserStatus newStatus = UserStatus.valueOf(newStatusStr.toUpperCase());
        return ResponseEntity.ok(userService.updateUserStatus(id, newStatus));
    }

    // API ĐỂ LƯU LÝ DO TỪ CHỐI/KHÓA
    @PostMapping("/{id}/notify")
    public ResponseEntity<?> sendNotification(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        String message = body.get("message");
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setBanReason(message);
        userRepository.save(user);
        return ResponseEntity.ok("Success");
    }

    // Xóa User
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("Xóa User thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // Tự nguyện cấm (Self-Exclusion) dành cho người chơi
    @PutMapping("/{id}/self-exclusion")
    public ResponseEntity<?> selfExclusion(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(userService.updateUserStatus(id, UserStatus.SELF_EXCLUSION));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // Lịch sử Cược
    @GetMapping("/my-bets")
    public ResponseEntity<?> getMyBets(@RequestParam Integer userId) {
        try {
            return ResponseEntity.ok(userService.getMyBets(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // Lịch sử Giao dịch
    @GetMapping("/my-transactions")
    public ResponseEntity<?> getMyTransactions(@RequestParam Integer userId) {
        try {
            return ResponseEntity.ok(userService.getMyTransactions(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-jockey-rewards")
    public ResponseEntity<?> getMyJockeyRewards(@RequestParam Integer userId) {
        try {
            return ResponseEntity.ok(userService.getMyJockeyRewards(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}