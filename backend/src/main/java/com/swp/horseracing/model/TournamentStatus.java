package com.swp.horseracing.model;

    // [Chức năng rõ ràng]: Enum Trạng thái Giải đấu
    // [Tác dụng]: Xác định giải đấu đang Lên lịch, Đang diễn ra hay Đã kết thúc.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm POSTPONED nếu giải đấu bị tạm hoãn vô thời hạn.
public enum TournamentStatus {
    UPCOMING, ONGOING, COMPLETED, CANCELED, POSTPONED
}