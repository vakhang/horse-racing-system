package com.swp.horseracing.dto;

import lombok.Data;

@Data
    // [Chức năng rõ ràng]: Lớp DTO nhận Request Lời mời
    // [Tác dụng]: Hứng thông tin từ Chủ ngựa khi họ muốn gửi lời mời thuê một Nài ngựa cụ thể tham gia lái ngựa của mình.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm thuộc tính nếu Chủ ngựa muốn gửi kèm lời nhắn (message).
public class InvitationRequestDTO {
    private Integer registrationId;
    private Integer jockeyId;
}