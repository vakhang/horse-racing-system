package com.swp.horseracing.model;

    // [Chức năng rõ ràng]: Enum Trạng thái Đăng ký thi đấu
    // [Tác dụng]: Trạng thái của 1 suất thi đấu (PENDING, APPROVED, REJECTED, WITHDRAWN, FINISHED).
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm DISQUALIFIED nếu ngựa bị loại do phạm luật.
public enum RegistrationStatus {
    WAITING_JOCKEY,
    PENDING_APPROVAL,
    APPROVED_BY_ADMIN,
    REJECTED_BY_ADMIN,
    WITHDRAWN,
    DISQUALIFIED,
    SCRATCH, NON_STARTER
}