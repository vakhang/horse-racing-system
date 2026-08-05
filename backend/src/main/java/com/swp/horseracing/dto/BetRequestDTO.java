package com.swp.horseracing.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
    // [Chức năng rõ ràng]: Lớp DTO nhận Request Đặt Cược
    // [Tác dụng]: Hứng dữ liệu từ Frontend khi người chơi bấm nút "Đặt cược" (bao gồm ID ngựa, ID chặng đua và số tiền).
    // [Hướng dẫn sửa đổi]:
    // - Data: Nếu Frontend gửi thêm tham số (như loại cược), hãy khai báo thêm thuộc tính tương ứng ở đây.
public class BetRequestDTO {
    private Integer spectatorId;
    private Integer raceId;
    private Integer registrationId;
    private BigDecimal amount;

    private com.swp.horseracing.model.BetType betType;
    private Integer registrationId2;
}