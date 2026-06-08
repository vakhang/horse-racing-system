package com.swp.horseracing.repository;

import com.swp.horseracing.model.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Integer> {
    boolean existsByName(String name);
}