package com.swp.horseracing.controller;

import com.swp.horseracing.dto.HorseRequestDTO;
import com.swp.horseracing.service.HorseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/horses")
@RequiredArgsConstructor
public class HorseController {

    private final HorseService horseService;

    // [Chức năng rõ ràng]: API Thêm Ngựa mới
    // [Tác dụng]: Nhận request tạo ngựa từ Chủ Ngựa (bao gồm text và file ảnh đại diện ngựa).
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Nếu đổi endpoint API tạo ngựa, hãy sửa `@PostMapping`.
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createHorse(@ModelAttribute HorseRequestDTO request) {
        try {
            return ResponseEntity.ok(horseService.createHorse(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // [Chức năng rõ ràng]: API Lấy danh sách Ngựa
    // [Tác dụng]: Trả về danh sách ngựa. Nếu truyền tham số `?ownerId=1` thì chỉ lấy ngựa của chủ đó, nếu không truyền thì lấy tất cả.
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Nếu muốn đổi tham số lọc, sửa `@RequestParam(required = false) Integer ownerId`.
    @GetMapping
    public ResponseEntity<?> getHorses(@RequestParam(required = false) Integer ownerId) {
        if (ownerId != null) {
            return ResponseEntity.ok(horseService.getHorsesByOwnerId(ownerId));
        }
        return ResponseEntity.ok(horseService.getAllHorses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getHorseById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(horseService.getHorseById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<?> updateHorse(@PathVariable Integer id, @ModelAttribute HorseRequestDTO request) {
        try {
            return ResponseEntity.ok(horseService.updateHorse(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHorse(@PathVariable Integer id) {
        try {
            horseService.deleteHorse(id);
            return ResponseEntity.ok("Xóa Ngựa thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}