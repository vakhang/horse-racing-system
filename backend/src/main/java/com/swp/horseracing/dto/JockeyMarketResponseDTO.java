package com.swp.horseracing.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
    // [Chức năng rõ ràng]: Lớp DTO trả về Thông tin Nài ngựa (Sàn giao dịch)
    // [Tác dụng]: Cung cấp dữ liệu tóm tắt của các Nài ngựa (tên, số trận thắng, kinh nghiệm) để Chủ ngựa xem và chọn thuê.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm thuộc tính tính toán (như tỷ lệ thắng %) nếu Frontend cần.
public class JockeyMarketResponseDTO {
    private Integer id;
    private String username;
    private Double weight;
    private Double height;
    private String phone;
    private String email;
    private String status; // SẴN SÀNG, ĐANG CÓ LỊCH, CHỜ DUYỆT
    private String avatarUrl;
}
