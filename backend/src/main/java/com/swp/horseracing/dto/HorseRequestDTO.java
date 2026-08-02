package com.swp.horseracing.dto;

import com.swp.horseracing.model.HorseStatus;
import lombok.Data;

@Data
    // [Chức năng rõ ràng]: Lớp DTO nhận Request Thêm/Sửa Ngựa
    // [Tác dụng]: Đóng gói dữ liệu text từ form đăng ký ngựa (tên, tuổi, mô tả) của Chủ ngựa.
    // [Hướng dẫn sửa đổi]:
    // - Data: Sửa thuộc tính nếu trong CSDL bảng Ngựa có thêm cột mới.
public class HorseRequestDTO {
    private String name;
    private Integer ownerId; // Bắt buộc để biết ngựa của ai
    private Integer age;
    private String breed;
    private String color;
    private HorseStatus status;
    private java.util.List<org.springframework.web.multipart.MultipartFile> certFiles;
    private java.util.List<org.springframework.web.multipart.MultipartFile> realImageFiles;
    private java.util.List<org.springframework.web.multipart.MultipartFile> vetRecordFiles;
    private String microchipCode;
    @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME)
    private java.time.LocalDateTime lastHealthCheck;
}