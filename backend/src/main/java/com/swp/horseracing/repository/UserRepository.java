package com.swp.horseracing.repository;

import com.swp.horseracing.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    // TÌM USER BẰNG EMAIL HOẶC SỐ ĐIỆN THOẠI
    Optional<User> findByEmailOrPhoneNumber(String email, String phoneNumber);

    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByIdNumber(String idNumber);
}
