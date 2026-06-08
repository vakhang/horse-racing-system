package com.swp.horseracing.repository;

import com.swp.horseracing.model.Bet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BetRepository extends JpaRepository<Bet, Integer> {

    // Tìm các phiếu cược theo chặng đua
    List<Bet> findByRaceId(Integer raceId);

    // Tính tổng tiền cược của một con ngựa (Registration) trong một chặng đua cụ thể
    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Bet b WHERE b.race.id = :raceId AND b.registration.id = :regId")
    BigDecimal sumAmountByRaceIdAndRegistrationId(@Param("raceId") Integer raceId, @Param("regId") Integer regId);

    // Truy xuất lịch sử cược của User
    // Đổi UserId thành SpectatorId
    List<Bet> findBySpectatorIdOrderByCreatedAtDesc(Integer spectatorId);
}