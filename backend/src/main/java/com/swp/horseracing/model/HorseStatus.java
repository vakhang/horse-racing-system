package com.swp.horseracing.model;

    // [Chức năng rõ ràng]: Enum Trạng thái Ngựa
    // [Tác dụng]: Trạng thái hoạt động của ngựa (PENDING, APPROVED, REJECTED, RETIRED).
    // [Hướng dẫn sửa đổi]:
    // - Data: Có thể thêm INJURED (Chấn thương) để chặn đăng ký thi đấu tạm thời.
public enum HorseStatus {
    PENDING, APPROVED, REJECTED
}