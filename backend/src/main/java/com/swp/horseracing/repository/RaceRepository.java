package com.swp.horseracing.repository;

import com.swp.horseracing.model.Race;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RaceRepository extends JpaRepository<Race, Integer> {
    // Hỗ trợ Frontend lấy toàn bộ chặng đua của 1 giải đấu cụ thể
    List<Race> findByTournamentId(Integer tournamentId);
}