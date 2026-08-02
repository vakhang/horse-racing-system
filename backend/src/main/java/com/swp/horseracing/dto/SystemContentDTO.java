package com.swp.horseracing.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
    // [Chức năng rõ ràng]: Lớp DTO cho Bài viết/Nội dung Tĩnh
    // [Tác dụng]: Dùng chung cho cả việc lấy và cập nhật (Admin) nội dung các trang như Luật chơi, Chính sách bảo mật (dạng HTML).
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm ngôn ngữ `lang` nếu muốn hỗ trợ đa ngôn ngữ.
public class SystemContentDTO {
    private Integer id;
    private String pageId;
    private String title;
    private String content;
    private LocalDateTime updatedAt;
}
