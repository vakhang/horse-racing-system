package com.swp.horseracing.dto;

import com.swp.horseracing.model.TournamentStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
    // [Chức năng rõ ràng]: Lớp DTO nhận Request Tạo Giải đấu
    // [Tác dụng]: Hứng tên, ngày bắt đầu, ngày kết thúc và mô tả từ Admin khi tạo một Giải đấu mới.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm thuộc tính hình ảnh banner cho Giải đấu.
public class TournamentRequestDTO {
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private TournamentStatus status;
    private String reason; // Phục vụ lưu Nhật ký khi Hủy/Hoãn
}