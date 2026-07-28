package com.swp.horseracing.repository;

import com.swp.horseracing.model.SystemContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemContentRepository extends JpaRepository<SystemContent, Integer> {
    Optional<SystemContent> findByPageId(String pageId);
}
