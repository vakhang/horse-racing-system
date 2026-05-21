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

    @PostMapping
    public ResponseEntity<?> createTournament(@RequestBody TournamentRequestDTO request) {
        try {
            return ResponseEntity.ok(tournamentService.createTournament(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
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
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTournament(@PathVariable Integer id, @RequestBody TournamentRequestDTO request) {
        try {
            return ResponseEntity.ok(tournamentService.updateTournament(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTournament(@PathVariable Integer id) {
        try {
            tournamentService.deleteTournament(id);
            return ResponseEntity.ok("Xóa Giải đấu thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}