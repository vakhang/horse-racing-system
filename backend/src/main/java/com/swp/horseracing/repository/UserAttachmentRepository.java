package com.swp.horseracing.repository;

import com.swp.horseracing.model.UserAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserAttachmentRepository extends JpaRepository<UserAttachment, Integer> {
    java.util.List<UserAttachment> findByUserId(Integer userId);
}
