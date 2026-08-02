package com.swp.horseracing.model;

    // [Chức năng rõ ràng]: Enum Trạng thái Giao dịch
    // [Tác dụng]: Trạng thái xử lý tiền (PENDING, COMPLETED, FAILED, REJECTED).
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm trạng thái PROCESSING nếu kết nối API ngân hàng mất nhiều thời gian.
public enum TransactionStatus {
    PENDING, COMPLETED, REJECTED
}