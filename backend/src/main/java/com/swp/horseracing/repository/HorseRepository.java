package com.swp.horseracing.repository;

import com.swp.horseracing.model.Horse;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

    // [Chức năng rõ ràng]: Interface kết nối DB (Horse)
    // [Tác dụng]: Thao tác bảng `horses`. Hỗ trợ tìm ngựa theo Chủ sở hữu (OwnerId) và Lấy ngựa tham gia nhiều chặng nhất.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm hàm `findByStatus` nếu muốn lọc riêng ngựa đang chờ duyệt.
public interface HorseRepository extends JpaRepository<Horse, Integer> {
    // Hỗ trợ FE lấy danh sách ngựa của 1 chủ ngựa cụ thể
    List<Horse> findByOwnerId(Integer ownerId);
    java.util.Optional<Horse> findByName(String name);
}