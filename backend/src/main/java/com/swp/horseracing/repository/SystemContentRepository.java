package com.swp.horseracing.repository;

import com.swp.horseracing.model.SystemContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
    // [Chức năng rõ ràng]: Interface kết nối DB (SystemContent)
    // [Tác dụng]: Thao tác bảng `system_contents`. Cho phép Admin quản lý các trang bài viết (pageId) như LUAT_CHOI.
    // [Hướng dẫn sửa đổi]:
    // - Data: Không cần chỉnh sửa nhiều, Spring Data JPA tự lo hàm `findByPageId`.
public interface SystemContentRepository extends JpaRepository<SystemContent, Integer> {
    Optional<SystemContent> findByPageId(String pageId);
}
