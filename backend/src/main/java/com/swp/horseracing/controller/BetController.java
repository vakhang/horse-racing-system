package com.swp.horseracing.controller;

import com.swp.horseracing.dto.BetRequestDTO;
import com.swp.horseracing.service.BetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bets")
@RequiredArgsConstructor
public class BetController {

    private final BetService betService;

    @PostMapping
    public ResponseEntity<?> createBet(@RequestBody BetRequestDTO request) {
        try {
            return ResponseEntity.ok(betService.createBet(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}