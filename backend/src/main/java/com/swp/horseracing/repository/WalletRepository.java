package com.swp.horseracing.repository;

import com.swp.horseracing.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Integer> {

    // Thêm dòng này để tìm kiếm ví dựa vào User Id liên kết
    Optional<Wallet> findByUserId(Integer userId);
}