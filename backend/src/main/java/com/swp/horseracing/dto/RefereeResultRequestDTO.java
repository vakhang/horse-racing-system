package com.swp.horseracing.dto;

import lombok.Data;

@Data
    // [Chức năng rõ ràng]: Lớp DTO nhận Request Kết quả thi đấu
    // [Tác dụng]: Hứng dữ liệu bảng xếp hạng các con ngựa sau khi chặng đua kết thúc (do Trọng tài nhập).
    // [Hướng dẫn sửa đổi]:
    // - Data: Nếu muốn ghi nhận thêm thời gian hoàn thành (Finish Time) của từng con ngựa, hãy thêm vào đây.
public class RefereeResultRequestDTO {
    private Integer raceId;
    private Integer top1RegistrationId; // ID của ngựa/nài đạt top 1
    private Integer top2RegistrationId; // ID của ngựa/nài đạt top 2
    private Integer top3RegistrationId; // ID của ngựa/nài đạt top 3
    private Integer refereeId;
}
