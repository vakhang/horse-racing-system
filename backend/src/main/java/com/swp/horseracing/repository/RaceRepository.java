package com.swp.horseracing.repository;

import com.swp.horseracing.model.Race;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

    // [Chức năng rõ ràng]: Interface kết nối DB (Race)
    // [Tác dụng]: Thao tác bảng `races`. Hỗ trợ tìm kiếm các chặng đua đang mở cược hoặc đã kết thúc, truy vấn theo Giải đấu (TournamentId).
    // [Hướng dẫn sửa đổi]:
    // - Data: Viết thêm `@Query` nếu muốn tìm các chặng đua diễn ra trong ngày hôm nay.
public interface RaceRepository extends JpaRepository<Race, Integer> {
    // Hỗ trợ Frontend lấy toàn bộ chặng đua của 1 giải đấu cụ thể
    @org.springframework.data.jpa.repository.Query("SELECT r FROM Race r JOIN FETCH r.tournament LEFT JOIN FETCH r.referee WHERE r.tournament.id = :tournamentId ORDER BY r.raceTime ASC")
    List<Race> findByTournamentId(
            @org.springframework.data.repository.query.Param("tournamentId") Integer tournamentId);

    @org.springframework.data.jpa.repository.Query("SELECT r FROM Race r JOIN FETCH r.tournament LEFT JOIN FETCH r.referee ORDER BY r.raceTime ASC")
    List<Race> findAllWithDetails();

    List<Race> findByRefereeId(Integer refereeId);
    List<Race> findByStatus(com.swp.horseracing.model.RaceStatus status);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT r FROM Race r WHERE r.id = :id")
    java.util.Optional<Race> findByIdWithPessimisticWrite(@org.springframework.data.repository.query.Param("id") Integer id);
}