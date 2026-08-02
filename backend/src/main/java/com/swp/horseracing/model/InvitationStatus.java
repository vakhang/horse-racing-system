package com.swp.horseracing.model;

    // [Chức năng rõ ràng]: Enum Trạng thái Lời mời
    // [Tác dụng]: Trạng thái của lời mời Nài ngựa (PENDING, ACCEPTED, REJECTED, CANCELLED).
    // [Hướng dẫn sửa đổi]:
    // - Data: Không cần thay đổi trừ khi thêm quy trình thương lượng (NEGOTIATING).
public enum InvitationStatus {
    PENDING, ACCEPTED, REJECTED, CANCELED
}