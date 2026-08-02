package com.swp.horseracing.repository;

import com.swp.horseracing.model.TransactionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
    // [Chức năng rõ ràng]: Interface kết nối DB (TransactionHistory)
    // [Tác dụng]: Thao tác bảng `transaction_history`. Hỗ trợ lấy toàn bộ lịch sử nạp/rút/cược của một người chơi, sắp xếp theo thời gian mới nhất.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm `@Query` để tính tổng tiền Nạp hoặc tổng tiền Rút trong tháng của 1 User.
public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, Integer> {
    
    // Tìm lịch sử giao dịch của 1 User
    java.util.List<TransactionHistory> findByWallet_UserIdOrderByCreatedAtDesc(Integer userId);
    // Thêm dòng này vào trong Repository của bạn:
    Optional<TransactionHistory> findByTransactionCode(String transactionCode);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT t FROM TransactionHistory t WHERE t.id = :id")
    Optional<TransactionHistory> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") Integer id);
}