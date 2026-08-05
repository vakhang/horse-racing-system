package com.swp.horseracing.model;

    // [Chức năng rõ ràng]: Enum Trạng thái Chặng đua
    // [Tác dụng]: Quản lý vòng đời chặng đua (SCHEDULED, BETTING_OPEN, BETTING_CLOSED, IN_PROGRESS, COMPLETED, CANCELLED).
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm trạng thái DELAYED nếu muốn phân biệt chặng đua bị hoãn với chặng đua chưa bắt đầu.
public enum RaceStatus {
    REGISTRATION, BETTING, LOCK_SESSION, RUNNING, FINISHED, RESULT_CONFIRMED, COMPLETED, CANCELED,
    PROVISIONAL_RESULT
}