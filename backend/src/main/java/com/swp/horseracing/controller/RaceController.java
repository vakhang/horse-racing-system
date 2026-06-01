package com.swp.horseracing.controller;

import com.swp.horseracing.dto.RaceRequestDTO;
import com.swp.horseracing.service.RaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/races")
@RequiredArgsConstructor
public class RaceController {

    private final RaceService raceService;

    @PostMapping
    public ResponseEntity<?> createRace(@RequestBody RaceRequestDTO request) {
        try {
            return ResponseEntity.ok(raceService.createRace(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
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
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRace(@PathVariable Integer id, @RequestBody RaceRequestDTO request) {
        try {
            return ResponseEntity.ok(raceService.updateRace(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRace(@PathVariable Integer id) {
        try {
            raceService.deleteRace(id);
            return ResponseEntity.ok("Xóa Chặng đua thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/live-odds")
    public ResponseEntity<?> getLiveOdds(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(raceService.getLiveOdds(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}