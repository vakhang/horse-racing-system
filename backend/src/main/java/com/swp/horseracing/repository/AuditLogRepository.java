package com.swp.horseracing.repository;

import com.swp.horseracing.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
    // [Chức năng rõ ràng]: Interface kết nối DB (AuditLog)
    // [Tác dụng]: Cung cấp các hàm cơ bản (CRUD) bằng Spring Data JPA để thao tác với bảng `audit_logs`.
    // [Hướng dẫn sửa đổi]:
    // - Data: Định nghĩa thêm các hàm tìm kiếm theo AdminID hoặc Hành động nếu cần trích xuất báo cáo.
public interface AuditLogRepository extends JpaRepository<AuditLog, Integer> {
}