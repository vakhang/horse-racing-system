package com.swp.horseracing.dto;

import com.swp.horseracing.model.HorseStatus;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
    // [Chức năng rõ ràng]: Lớp DTO trả về Thông tin Ngựa
    // [Tác dụng]: Chứa dữ liệu chi tiết của một chú ngựa (bao gồm tên, tuổi, hình ảnh, chỉ số) trả về cho Frontend hiển thị.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm trường dữ liệu nếu Frontend yêu cầu hiển thị thêm thông tin (ví dụ: lịch sử thắng).
public class HorseResponseDTO {
    private Integer id;
    private String name;
    private Integer ownerId;
    private String ownerUsername;
    private Integer age;
    private String breed;
    private String color;

    // Mảng tài liệu thay vì String đơn
    private List<String> certDocumentUrls;
    private List<String> realImageUrls;
    private List<String> vetRecordUrls;

    private HorseStatus status;
    private Integer totalRaces;
    private Integer winRaces;
    private Float winRate;
    private String healthStatus;
    
    private String microchipCode;
    private java.time.LocalDateTime lastHealthCheck;
    private Integer classLevel;
    private Integer rating;
}