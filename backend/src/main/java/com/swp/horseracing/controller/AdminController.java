package com.swp.horseracing.controller;

import com.swp.horseracing.dto.CompleteWithdrawalRequestDTO;
import com.swp.horseracing.service.AdminTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminTransactionService adminTransactionService;

    // Duyệt rút tiền
    @PutMapping("/withdrawals/{id}/complete")
    public ResponseEntity<?> completeWithdrawal(
            @PathVariable Integer id,
            @RequestBody CompleteWithdrawalRequestDTO request) {
        try {
            return ResponseEntity.ok(adminTransactionService.completeWithdrawal(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Thống kê tài chính cho Admin
    @GetMapping("/finance/dashboard")
    public ResponseEntity<?> getFinanceDashboard() {
        return ResponseEntity.ok(adminTransactionService.getFinanceDashboard());
    }
}