package com.swp.horseracing.repository;

import com.swp.horseracing.model.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
    // [Chức năng rõ ràng]: Interface kết nối DB (Tournament)
    // [Tác dụng]: Thao tác bảng `tournaments`.
    // [Hướng dẫn sửa đổi]:
    // - Data: Viết thêm hàm tìm kiếm Giải đấu có số tiền thưởng cao nhất nếu muốn làm tính năng "Hot Tournaments".
public interface TournamentRepository extends JpaRepository<Tournament, Integer> {
    boolean existsByName(String name);
}