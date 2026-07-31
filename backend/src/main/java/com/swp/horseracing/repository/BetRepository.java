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
    @Query("SELECT SUM(b.amount) FROM Bet b WHERE b.race.id = :raceId AND b.registration.id = :regId AND b.status NOT IN (com.swp.horseracing.model.BetStatus.CANCELED, com.swp.horseracing.model.BetStatus.REFUNDED)")
    BigDecimal sumAmountByRaceIdAndRegistrationId(@Param("raceId") Integer raceId, @Param("regId") Integer regId);

    // Truy xuất lịch sử cược của User
    // Đổi UserId thành SpectatorId
    List<Bet> findBySpectatorIdOrderByCreatedAtDesc(Integer spectatorId);

    // Tính tổng tiền cược trong ngày của khán giả
    @Query("SELECT SUM(b.amount) FROM Bet b WHERE b.spectator.id = :spectatorId AND b.createdAt >= :startDate AND b.createdAt <= :endDate AND b.status NOT IN (com.swp.horseracing.model.BetStatus.CANCELED, com.swp.horseracing.model.BetStatus.REFUNDED)")
    BigDecimal sumDailyBetAmountBySpectatorId(
        @Param("spectatorId") Integer spectatorId, 
        @Param("startDate") java.time.LocalDateTime startDate, 
        @Param("endDate") java.time.LocalDateTime endDate
    );
}