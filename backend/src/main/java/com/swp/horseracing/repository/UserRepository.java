package com.swp.horseracing.repository;

import com.swp.horseracing.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByEmail(String email); // Hàm check trùng email tự động
    Optional<User> findByEmail(String email);
}