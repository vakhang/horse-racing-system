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

    @PostMapping
    public ResponseEntity<?> createHorse(@RequestBody HorseRequestDTO request) {
        try {
            return ResponseEntity.ok(horseService.createHorse(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Nếu truyền ?ownerId=1 thì lấy ngựa của ông chủ đó, không thì lấy tất cả
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
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateHorse(@PathVariable Integer id, @RequestBody HorseRequestDTO request) {
        try {
            return ResponseEntity.ok(horseService.updateHorse(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHorse(@PathVariable Integer id) {
        try {
            horseService.deleteHorse(id);
            return ResponseEntity.ok("Xóa Ngựa thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}