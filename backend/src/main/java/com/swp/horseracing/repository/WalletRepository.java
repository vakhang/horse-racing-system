package com.swp.horseracing.repository;

import com.swp.horseracing.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
    // [Chức năng rõ ràng]: Interface kết nối DB (Wallet)
    // [Tác dụng]: Thao tác bảng `wallets`. Hỗ trợ lấy Ví tiền theo ID người dùng.
    // [Hướng dẫn sửa đổi]:
    // - Data: Sử dụng cơ chế Lock (Bi quan/Lạc quan) trên `@Query` nếu sau này hệ thống gặp lỗi tranh chấp (Race condition) khi trừ tiền.
public interface WalletRepository extends JpaRepository<Wallet, Integer> {
    Optional<Wallet> findByUserId(Integer userId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT w FROM Wallet w WHERE w.user.id = :userId")
    Optional<Wallet> findByUserIdForUpdate(@org.springframework.data.repository.query.Param("userId") Integer userId);
}