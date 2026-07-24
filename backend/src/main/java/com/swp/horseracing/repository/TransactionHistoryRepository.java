package com.swp.horseracing.repository;

import com.swp.horseracing.model.TransactionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, Integer> {
    
    // Tìm lịch sử giao dịch của 1 User
    java.util.List<TransactionHistory> findByWallet_UserIdOrderByCreatedAtDesc(Integer userId);
    // Thêm dòng này vào trong Repository của bạn:
    Optional<TransactionHistory> findByTransactionCode(String transactionCode);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT t FROM TransactionHistory t WHERE t.id = :id")
    Optional<TransactionHistory> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") Integer id);
}