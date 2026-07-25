package com.swp.horseracing.repository;

import com.swp.horseracing.model.PrizeConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrizeConfigRepository extends JpaRepository<PrizeConfig, Integer> {
}
