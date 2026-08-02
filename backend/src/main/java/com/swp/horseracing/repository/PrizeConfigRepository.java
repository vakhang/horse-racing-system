package com.swp.horseracing.repository;

import com.swp.horseracing.model.PrizeConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
    // [Chức năng rõ ràng]: Interface kết nối DB (PrizeConfig)
    // [Tác dụng]: Thao tác bảng `prize_configs`.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thường chỉ cần cấu hình chung (CRUD cơ bản), ít khi phải viết thêm hàm phức tạp.
public interface PrizeConfigRepository extends JpaRepository<PrizeConfig, Integer> {
}
