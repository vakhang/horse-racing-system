package com.swp.horseracing.model;

    // [Chức năng rõ ràng]: Enum Loại giấy tờ Ngựa
    // [Tác dụng]: Phân loại các tài liệu đính kèm của Ngựa (CERTIFICATE, REAL_IMAGE, VET_RECORD).
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm giá trị nếu yêu cầu thêm loại giấy tờ khác (VD: DNA_TEST).
public enum HorseDocType {
    CERTIFICATE, REAL_IMAGE, VET_RECORD
}