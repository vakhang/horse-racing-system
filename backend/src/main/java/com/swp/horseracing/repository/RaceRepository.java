package com.swp.horseracing.repository;

import com.swp.horseracing.model.Race;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RaceRepository extends JpaRepository<Race, Integer> {
    // Hỗ trợ Frontend lấy toàn bộ chặng đua của 1 giải đấu cụ thể
    @org.springframework.data.jpa.repository.Query("SELECT r FROM Race r JOIN FETCH r.tournament LEFT JOIN FETCH r.referee WHERE r.tournament.id = :tournamentId")
    List<Race> findByTournamentId(
            @org.springframework.data.repository.query.Param("tournamentId") Integer tournamentId);

    @org.springframework.data.jpa.repository.Query("SELECT r FROM Race r JOIN FETCH r.tournament LEFT JOIN FETCH r.referee")
    List<Race> findAllWithDetails();

    List<Race> findByRefereeId(Integer refereeId);
}