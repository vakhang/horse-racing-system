package com.swp.horseracing.repository;

import com.swp.horseracing.model.Horse;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HorseRepository extends JpaRepository<Horse, Integer> {
    // Hỗ trợ FE lấy danh sách ngựa của 1 chủ ngựa cụ thể
    List<Horse> findByOwnerId(Integer ownerId);
}