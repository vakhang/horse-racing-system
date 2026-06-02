package com.swp.horseracing.repository;

import com.swp.horseracing.model.TransactionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, Integer> {
    
    // Tìm lịch sử giao dịch của 1 User
    java.util.List<TransactionHistory> findByWallet_UserIdOrderByCreatedAtDesc(Integer userId);
}