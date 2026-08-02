package com.swp.horseracing.model;

    // [Chức năng rõ ràng]: Enum Hướng Giao dịch (Dòng tiền)
    // [Tác dụng]: Xác định dòng tiền là chảy vào (IN - Nạp/Thắng) hay chảy ra (OUT - Rút/Cược).
    // [Hướng dẫn sửa đổi]:
    // - Data: Thường cố định 2 chiều, không cần thêm.
public enum TransactionDirection {
    IN,
    OUT
}