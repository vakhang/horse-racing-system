package com.swp.horseracing.repository;

import com.swp.horseracing.model.SystemAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SystemAnnouncementRepository extends JpaRepository<SystemAnnouncement, Integer> {
    List<SystemAnnouncement> findAllByOrderByCreatedAtDesc();
}
