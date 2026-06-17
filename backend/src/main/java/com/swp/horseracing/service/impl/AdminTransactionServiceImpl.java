package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.CompleteWithdrawalRequestDTO;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.RaceRepository;
import com.swp.horseracing.repository.TransactionHistoryRepository;
import com.swp.horseracing.service.AdminTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminTransactionServiceImpl implements AdminTransactionService {

    private final TransactionHistoryRepository transactionRepository;
    private final RaceRepository raceRepository;

    @Override
    @Transactional
    public String completeWithdrawal(Integer transactionId, CompleteWithdrawalRequestDTO request) {
        TransactionHistory history = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch này!"));
        if (history.getType() != TransactionType.WITHDRAW) throw new RuntimeException("Đây không phải là giao dịch rút tiền!");
        if (history.getStatus() == TransactionStatus.COMPLETED) throw new RuntimeException("Giao dịch này đã được hoàn tất trước đó!");

        history.setStatus(TransactionStatus.COMPLETED);
        if(request.getProofUrl() != null) history.setProofUrl(request.getProofUrl());
        transactionRepository.save(history);
        return "Duyệt lệnh rút tiền thành công!";
    }

    @Override
    public Map<String, Object> getFinanceDashboard() {
        List<Race> races = raceRepository.findAll();
        // Tổng tiền cược vào hệ thống
        BigDecimal ggr = races.stream()
                .map(r -> r.getTotalPool() != null ? r.getTotalPool() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Doanh thu thực (Phế 20%)
        BigDecimal ngr = races.stream()
                .map(r -> (r.getTotalPool() != null ? r.getTotalPool() : BigDecimal.ZERO)
                        .multiply(r.getRakePercentage()).divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Lấy danh sách giao dịch đổ ra Sổ cái (Xếp mới nhất lên đầu)
        List<TransactionHistory> allTxs = transactionRepository.findAll();
        allTxs.sort((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt()));

        return Map.of(
                "ggr", ggr,
                "ngr", ngr,
                "transactions", allTxs
        );
    }
}