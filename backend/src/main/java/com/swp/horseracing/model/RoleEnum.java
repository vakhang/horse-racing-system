package com.swp.horseracing.model;

    // [Chức năng rõ ràng]: Enum Phân quyền Hệ thống (Role)
    // [Tác dụng]: Định nghĩa quyền của User: ADMIN, REFEREE, OWNER (Chủ ngựa), JOCKEY (Nài ngựa), SPECTATOR (Khán giả).
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm SUPER_ADMIN nếu cần phân cấp quản trị viên.
public enum RoleEnum {
    ADMIN, OWNER, JOCKEY, REFEREE, SPECTATOR
}