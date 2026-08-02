package com.swp.horseracing.model;

    // [Chức năng rõ ràng]: Enum Loại Giao dịch
    // [Tác dụng]: Phân biệt nguyên nhân biến động số dư (DEPOSIT, WITHDRAW, BET, REWARD, CANCEL_REFUND).
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm BONUS nếu hệ thống tặng tiền tân thủ.
public enum TransactionType {
    DEPOSIT, WITHDRAW, BET, REWARD, REFUND, TAX
}