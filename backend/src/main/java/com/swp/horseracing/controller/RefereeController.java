package com.swp.horseracing.controller;

import com.swp.horseracing.dto.RefereeReportRequestDTO;
import com.swp.horseracing.dto.RefereeResultRequestDTO;
import com.swp.horseracing.service.RefereeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/referees")
@RequiredArgsConstructor
public class RefereeController {

    private final RefereeService refereeService;

    @PostMapping("/results")
    public ResponseEntity<?> submitRaceResult(@RequestBody RefereeResultRequestDTO request) {
        try {
            return ResponseEntity.ok(refereeService.submitRaceResult(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reports")
    public ResponseEntity<?> submitReport(@RequestBody RefereeReportRequestDTO request) {
        try {
            return ResponseEntity.ok(refereeService.submitReport(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
