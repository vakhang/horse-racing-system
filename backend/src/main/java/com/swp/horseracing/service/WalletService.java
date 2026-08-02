package com.swp.horseracing.service;

import com.swp.horseracing.model.Wallet;
import java.math.BigDecimal;

    // [Chức năng rõ ràng]: Interface Service Ví tiền
    // [Tác dụng]: Định nghĩa hàm nạp, rút và lấy số dư ví.
    // [Hướng dẫn sửa đổi]:
    // - Logic: Thêm hàm chuyển tiền nội bộ giữa các User.
public interface WalletService {
    Wallet getWalletByUserId(Integer userId);
    Wallet depositMoney(Integer userId, BigDecimal amount);
    String requestWithdrawal(Integer userId, BigDecimal amount, String bankName, String accNumber, String accName);
}