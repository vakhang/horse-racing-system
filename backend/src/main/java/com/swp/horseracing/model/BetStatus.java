package com.swp.horseracing.model;

    // [Chức năng rõ ràng]: Enum Trạng thái Vé cược
    // [Tác dụng]: Chỉ định trạng thái của một vé cược (PENDING, WON, LOST, CANCELLED).
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm trạng thái REFUNDED nếu có chính sách hoàn tiền riêng.
public enum BetStatus {
    PENDING, WON, LOST, CANCELED, REFUNDED
}