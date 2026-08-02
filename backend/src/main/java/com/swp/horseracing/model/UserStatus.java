package com.swp.horseracing.model;

    // [Chức năng rõ ràng]: Enum Trạng thái Người dùng
    // [Tác dụng]: Quản lý trạng thái tài khoản (PENDING_APPROVAL, APPROVED, REJECTED, BANNED, SELF_EXCLUSION).
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm INACTIVE nếu người dùng không đăng nhập quá 6 tháng.
public enum UserStatus {
    PENDING, APPROVED, REJECTED, BANNED, RED_FLAG, SELF_EXCLUSION
}