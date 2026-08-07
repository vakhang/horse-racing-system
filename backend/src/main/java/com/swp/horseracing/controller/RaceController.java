package com.swp.horseracing.controller;

import com.swp.horseracing.dto.RaceRequestDTO;
import com.swp.horseracing.dto.RaceResponseDTO;
import com.swp.horseracing.service.RaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/races")
@RequiredArgsConstructor
public class RaceController {

    private final RaceService raceService;

    // [Chức năng rõ ràng]: API Tạo Chặng Đua
    // [Tác dụng]: Nhận request từ Admin/Ban Tổ Chức để tạo một chặng đua mới thuộc về 1 Giải đấu.
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Nếu đổi endpoint API tạo chặng đua, hãy sửa `@PostMapping`.
    @PostMapping
    public ResponseEntity<?> createRace(@RequestBody RaceRequestDTO request) {
        try {
            return ResponseEntity.ok(raceService.createRace(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // Nếu Client truyền /api/races?tournamentId=1 thì lấy chặng của giải 1
    // Nếu không truyền thì lấy tất cả
    @GetMapping
    public ResponseEntity<?> getRaces(@RequestParam(required = false) Integer tournamentId) {
        if (tournamentId != null) {
            return ResponseEntity.ok(raceService.getRacesByTournamentId(tournamentId));
        }
        return ResponseEntity.ok(raceService.getAllRaces());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRaceById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(raceService.getRaceById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRace(@PathVariable Integer id, @RequestBody RaceRequestDTO request) {
        try {
            return ResponseEntity.ok(raceService.updateRace(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRace(@PathVariable Integer id) {
        raceService.deleteRace(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/transition")
    public ResponseEntity<RaceResponseDTO> forceTransition(@PathVariable Integer id, @RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(raceService.forceTransition(id, body.get("status")));
    }

    @GetMapping("/{id}/live-odds")
    public ResponseEntity<?> getLiveOdds(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(raceService.getLiveOdds(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // [Chức năng rõ ràng]: API Trả thưởng Chặng đua
    // [Tác dụng]: Gọi hàm trả thưởng khi chặng đua kết thúc. Hàm này chia tiền cho những người đoán trúng và Nài/Chủ ngựa thắng giải.
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Đổi endpoint bằng cách sửa `@PostMapping("/{id}/payout")`.
    @PostMapping("/{id}/payout")
    public ResponseEntity<?> payoutRace(@PathVariable Integer id) {
        try {
            raceService.payoutRace(id);
            return ResponseEntity.ok("Trả thưởng chặng đua thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/referee")
    public ResponseEntity<?> updateRaceReferee(@PathVariable Integer id, @RequestBody java.util.Map<String, Integer> body) {
        try {
            Integer refereeId = body.get("refereeId");
            return ResponseEntity.ok(raceService.updateRaceReferee(id, refereeId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}