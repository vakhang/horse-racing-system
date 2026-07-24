package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.TransactionHistoryResponseDTO;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.RaceRepository;
import com.swp.horseracing.repository.TransactionHistoryRepository;
import com.swp.horseracing.repository.WalletRepository;
import com.swp.horseracing.repository.AuditLogRepository;
import com.swp.horseracing.service.AdminTransactionService;
import com.swp.horseracing.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminTransactionServiceImpl implements AdminTransactionService {

    private final TransactionHistoryRepository transactionRepository;
    private final RaceRepository raceRepository;
    private final WalletRepository walletRepository;
    private final FileStorageService fileStorageService;
    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public String completeWithdrawal(Integer transactionId, MultipartFile proofFile) {
        TransactionHistory history = transactionRepository.findByIdForUpdate(transactionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch này!"));
        if (history.getType() != TransactionType.WITHDRAW) throw new RuntimeException("Đây không phải là giao dịch rút tiền!");
        if (history.getStatus() != TransactionStatus.PENDING) {
            throw new IllegalStateException("Transaction already processed!");
        }

        if (proofFile == null || proofFile.isEmpty()) {
            throw new RuntimeException("Bắt buộc phải tải lên tệp Ủy Nhiệm Chi / Biên lai!");
        }

        String folder = "withdrawals/" + history.getTransactionCode();
        String fileUrl = fileStorageService.storeFile(proofFile, folder);

        history.setStatus(TransactionStatus.COMPLETED);
        history.setProofUrl(fileUrl);
        transactionRepository.save(history);
        
        auditLogRepository.save(AuditLog.builder()
                .action("APPROVE_WITHDRAW")
                .performedBy("ADMIN")
                .reason("Duyệt rút tiền cho mã GD: " + history.getTransactionCode())
                .totalRefundAmount(history.getAmount())
                .build());

        return "Xác nhận chi trả tiền mặt thành công!";
    }

    @Override
    public Map<String, Object> getFinanceDashboard() {
        List<Race> races = raceRepository.findAllWithDetails();
        BigDecimal ggr = races.stream()
                .map(r -> r.getTotalPool() != null ? r.getTotalPool() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, (a, b) -> a.add(b));

        BigDecimal ngr = races.stream()
                .map(r -> (r.getTotalPool() != null ? r.getTotalPool() : BigDecimal.ZERO)
                        .multiply(r.getRakePercentage()).divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP))
                .reduce(BigDecimal.ZERO, (a, b) -> a.add(b));

        List<TransactionHistory> allTxs = transactionRepository.findAll();
        
        BigDecimal taxCollected = allTxs.stream()
                .map(t -> t.getTaxAmount() != null ? t.getTaxAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, (a, b) -> a.add(b));

        allTxs.sort((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt()));

        // Ánh xạ ra DTO để FE lấy được Bank Info
        List<TransactionHistoryResponseDTO> dtoList = allTxs.stream().map(tx -> TransactionHistoryResponseDTO.builder()
                .id(tx.getId())
                .transactionCode(tx.getTransactionCode())
                .amount(tx.getAmount())
                .type(tx.getType())
                .direction(tx.getDirection())
                .status(tx.getStatus())
                .proofUrl(tx.getProofUrl())
                .bankName(tx.getBankName())
                .accountNumber(tx.getAccountNumber())
                .accountName(tx.getAccountName())
                .createdAt(tx.getCreatedAt())
                .build()
        ).collect(Collectors.toList());

        return Map.of(
                "ggr", ggr,
                "ngr", ngr,
                "taxCollected", taxCollected,
                "transactions", dtoList
        );
    }

    @Override
    @Transactional
    public String approveDeposit(Integer transactionId) {
        TransactionHistory history = transactionRepository.findByIdForUpdate(transactionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch này!"));
                
        if (history.getStatus() != TransactionStatus.PENDING) {
            throw new IllegalStateException("Transaction already processed!");
        }
        
        history.setStatus(TransactionStatus.COMPLETED);
        transactionRepository.save(history);
        
        Wallet wallet = walletRepository.findByUserIdForUpdate(history.getWallet().getUser().getId())
                .orElseThrow(() -> new RuntimeException("Lỗi ví người chơi"));
        wallet.setBalance(wallet.getBalance().add(history.getAmount()));
        walletRepository.save(wallet);
        
        auditLogRepository.save(AuditLog.builder()
                .action("APPROVE_DEPOSIT")
                .performedBy("ADMIN")
                .reason("Duyệt nạp tiền cho mã GD: " + history.getTransactionCode())
                .totalRefundAmount(history.getAmount())
                .build());
                
        return "Duyệt nạp tiền thành công!";
    }

    @Override
    @Transactional
    public String rejectDeposit(Integer transactionId) {
        TransactionHistory history = transactionRepository.findByIdForUpdate(transactionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch này!"));
                
        if (history.getStatus() != TransactionStatus.PENDING) {
            throw new IllegalStateException("Transaction already processed!");
        }
        
        history.setStatus(TransactionStatus.REJECTED);
        transactionRepository.save(history);
        
        auditLogRepository.save(AuditLog.builder()
                .action("REJECT_DEPOSIT")
                .performedBy("ADMIN")
                .reason("Từ chối nạp tiền cho mã GD: " + history.getTransactionCode())
                .totalRefundAmount(history.getAmount())
                .build());
                
        return "Đã từ chối lệnh nạp tiền này!";
    }
}