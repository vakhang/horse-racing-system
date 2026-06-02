package com.swp.horseracing.controller;

import com.swp.horseracing.dto.CompleteWithdrawalRequestDTO;
import com.swp.horseracing.service.AdminTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/withdrawals")
@RequiredArgsConstructor
public class AdminController {

    private final AdminTransactionService adminTransactionService;

    // Admin (Kế toán) duyệt lệnh rút tiền
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeWithdrawal(
            @PathVariable Integer id, 
            @RequestBody CompleteWithdrawalRequestDTO request) {
        try {
            return ResponseEntity.ok(adminTransactionService.completeWithdrawal(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
