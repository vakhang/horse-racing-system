package com.swp.horseracing.repository;

import com.swp.horseracing.model.RefereeReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
    // [Chức năng rõ ràng]: Interface kết nối DB (RefereeReport)
    // [Tác dụng]: Thao tác bảng `referee_reports`. Hỗ trợ tìm báo cáo theo Chặng đua (RaceId).
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm hàm tìm kiếm theo Mã Trọng Tài (RefereeId) nếu muốn kiểm tra hiệu suất của một trọng tài cụ thể.
public interface RefereeReportRepository extends JpaRepository<RefereeReport, Integer> {
    java.util.List<RefereeReport> findByRaceId(Integer raceId);
}
