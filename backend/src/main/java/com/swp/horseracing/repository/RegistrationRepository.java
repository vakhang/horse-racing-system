package com.swp.horseracing.repository;

import com.swp.horseracing.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

    // [Chức năng rõ ràng]: Interface kết nối DB (Registration)
    // [Tác dụng]: Thao tác bảng `registrations`. Chứa các hàm kiểm tra trùng lặp (Ngựa/Nài đã đăng ký chưa) và các Custom Query thống kê thứ hạng.
    // [Hướng dẫn sửa đổi]:
    // - Data: Khi sửa đổi câu lệnh `@Query` thống kê Top Nài Ngựa/Chủ Ngựa, hãy cẩn thận với cấu trúc JOIN các bảng.
public interface RegistrationRepository extends JpaRepository<Registration, Integer> {
    List<Registration> findByRaceId(Integer raceId);

    boolean existsByRaceIdAndHorseId(Integer raceId, Integer horseId);

    boolean existsByRaceIdAndGateNumber(Integer raceId, Integer gateNumber);

    List<Registration> findByOwnerId(Integer ownerId);

    List<Registration> findByJockeyId(Integer jockeyId);

    @Query("SELECT r FROM Registration r WHERE r.jockey.id = :jockeyId AND r.race.raceTime = :raceTime")
    List<Registration> findByJockeyAndRaceTime(@Param("jockeyId") Integer jockeyId,
            @Param("raceTime") LocalDateTime raceTime);
}
