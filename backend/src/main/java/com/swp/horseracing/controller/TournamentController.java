package com.swp.horseracing.controller;

import com.swp.horseracing.dto.TournamentRequestDTO;
import com.swp.horseracing.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tournaments")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;

    // [Chức năng rõ ràng]: API Tạo Giải Đấu
    // [Tác dụng]: Nhận request từ Admin/Ban Tổ Chức để tạo một giải đấu mới.
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Đổi endpoint bằng cách sửa `@PostMapping`.
    @PostMapping
    public ResponseEntity<?> createTournament(@RequestBody TournamentRequestDTO request) {
        try {
            return ResponseEntity.ok(tournamentService.createTournament(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllTournaments() {
        return ResponseEntity.ok(tournamentService.getAllTournaments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTournamentById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(tournamentService.getTournamentById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTournament(@PathVariable Integer id, @RequestBody TournamentRequestDTO request) {
        try {
            return ResponseEntity.ok(tournamentService.updateTournament(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTournament(@PathVariable Integer id) {
        try {
            tournamentService.deleteTournament(id);
            return ResponseEntity.ok("Xóa Giải đấu thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
    // API Hủy giải đấu và hoàn tiền
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelTournament(@PathVariable Integer id) {
        try {
            tournamentService.cancelTournament(id);
            return ResponseEntity.ok(java.util.Map.of("message", "Hủy giải đấu và hoàn tiền cho toàn bộ người chơi thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}