package com.swp.horseracing.controller;

import com.swp.horseracing.service.AdminTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminTransactionService adminTransactionService;

    // Duyệt rút tiền CÓ UPLOAD FILE
    @PutMapping(value = "/withdrawals/{id}/complete", consumes = "multipart/form-data")
    public ResponseEntity<?> completeWithdrawal(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(adminTransactionService.completeWithdrawal(id, file));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/finance/dashboard")
    public ResponseEntity<?> getFinanceDashboard() {
        return ResponseEntity.ok(adminTransactionService.getFinanceDashboard());
    }

    @PutMapping("/deposits/{id}/approve")
    public ResponseEntity<?> approveDeposit(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(adminTransactionService.approveDeposit(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/deposits/{id}/reject")
    public ResponseEntity<?> rejectDeposit(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(adminTransactionService.rejectDeposit(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}