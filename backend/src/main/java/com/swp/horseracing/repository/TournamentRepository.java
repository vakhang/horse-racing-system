package com.swp.horseracing.repository;

import com.swp.horseracing.model.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TournamentRepository extends JpaRepository<Tournament, Integer> {
    boolean existsByName(String name); // Hàm check trùng tên giải đấu
}