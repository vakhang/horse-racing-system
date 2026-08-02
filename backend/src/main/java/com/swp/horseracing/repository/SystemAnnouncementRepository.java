package com.swp.horseracing.repository;

import com.swp.horseracing.model.SystemAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

    // [Chức năng rõ ràng]: Interface kết nối DB (SystemAnnouncement)
    // [Tác dụng]: Thao tác bảng `system_announcements`. Sắp xếp thông báo mới nhất lên đầu nhờ OrderByCreatedAtDesc.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm hàm lọc thông báo theo Đối tượng (Roles) nếu có chức năng Gửi thông báo riêng.
public interface SystemAnnouncementRepository extends JpaRepository<SystemAnnouncement, Integer> {
    List<SystemAnnouncement> findAllByOrderByCreatedAtDesc();
}
