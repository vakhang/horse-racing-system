package com.swp.horseracing.model;

    // [Chức năng rõ ràng]: Enum Loại giấy tờ Người dùng
    // [Tác dụng]: Phân loại ảnh tải lên (AVATAR, ID_CARD_FRONT, ID_CARD_BACK).
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm DRIVING_LICENSE hoặc PASSPORT nếu chấp nhận giấy tờ khác để KYC.
public enum UserDocType {
    ID_CARD, PASSPORT, JOCKEY_CERT, HEALTH_CHECK, REFEREE_CERT
}