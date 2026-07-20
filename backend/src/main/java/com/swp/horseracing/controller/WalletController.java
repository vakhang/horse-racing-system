package com.swp.horseracing.controller;

import com.swp.horseracing.dto.DepositRequestDTO;
import com.swp.horseracing.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/my-wallet")
    public ResponseEntity<?> getMyWallet(@RequestParam Integer userId) {
        try {
            return ResponseEntity.ok(walletService.getWalletByUserId(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(@RequestBody DepositRequestDTO request) {
        try {
            return ResponseEntity.ok(walletService.depositMoney(request.getUserId(), request.getAmount()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> requestWithdrawal(@RequestBody com.swp.horseracing.dto.WithdrawRequestDTO request) {
        try {
            String transCode = walletService.requestWithdrawal(
                    request.getUserId(),
                    request.getAmount(),
                    request.getBankName(),
                    request.getAccountNumber(),
                    request.getAccountName()
            );
            return ResponseEntity.ok(java.util.Map.of("transactionCode", transCode));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}