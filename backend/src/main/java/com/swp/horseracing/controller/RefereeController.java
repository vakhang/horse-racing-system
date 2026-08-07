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

    // [Chức năng rõ ràng]: API Cập nhật Kết quả chặng đua
    // [Tác dụng]: Trọng tài gọi API này để báo cáo kết quả (con ngựa nào hạng mấy). Sau đó chặng đua mới có thể trả thưởng.
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Nếu đổi endpoint API cập nhật kết quả, hãy sửa `@PostMapping("/results")`.
    @PostMapping("/results")
    public ResponseEntity<?> submitRaceResult(@RequestBody RefereeResultRequestDTO request) {
        try {
            return ResponseEntity.ok(refereeService.submitRaceResult(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reports")
    public ResponseEntity<?> submitReport(@RequestBody RefereeReportRequestDTO request) {
        try {
            return ResponseEntity.ok(refereeService.submitReport(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getAllReports() {
        try {
            return ResponseEntity.ok(refereeService.getAllReports());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/non-starter")
    public ResponseEntity<?> declareNonStarter(@RequestBody com.swp.horseracing.dto.RefereeNonStarterRequestDTO request) {
        try {
            return ResponseEntity.ok(refereeService.declareNonStarter(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/weighing")
    public ResponseEntity<?> recordWeighIn(@RequestBody com.swp.horseracing.dto.RefereeWeighingRequestDTO request) {
        try {
            return ResponseEntity.ok(refereeService.recordWeighIn(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
