package com.swp.horseracing.repository;

import com.swp.horseracing.model.RefereeReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefereeReportRepository extends JpaRepository<RefereeReport, Integer> {
}
