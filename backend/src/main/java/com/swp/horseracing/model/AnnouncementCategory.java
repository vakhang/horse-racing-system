package com.swp.horseracing.model;

    // [Chức năng rõ ràng]: Enum Phân loại Thông báo
    // [Tác dụng]: Định nghĩa các loại thông báo hệ thống (SYSTEM, EVENT, MAINTENANCE) để dễ dàng lọc trên UI.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm giá trị mới vào Enum này nếu hệ thống có thêm loại thông báo khác (VD: PROMOTION).
public enum AnnouncementCategory {
    SYSTEM,
    LEGAL,
    NEWS,
    WARNING
}
