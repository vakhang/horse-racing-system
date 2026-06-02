package com.swp.horseracing.controller;

import com.swp.horseracing.dto.DepositRequestDTO;
import com.swp.horseracing.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    // Lấy số dư hiện tại qua ?userId=X (Vì hệ thống chưa tích hợp Spring Security JWT lấy Principal)
    @GetMapping("/my-wallet")
    public ResponseEntity<?> getMyWallet(@RequestParam Integer userId) {
        try {
            return ResponseEntity.ok(walletService.getWalletByUserId(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API nạp tiền
    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(@RequestBody DepositRequestDTO request) {
        try {
            return ResponseEntity.ok(walletService.depositMoney(request.getUserId(), request.getAmount()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API rút toàn bộ tiền
    @PostMapping("/withdraw")
    public ResponseEntity<?> requestWithdrawal(@RequestBody com.swp.horseracing.dto.WithdrawRequestDTO request) {
        try {
            return ResponseEntity.ok(walletService.requestWithdrawal(request.getUserId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}