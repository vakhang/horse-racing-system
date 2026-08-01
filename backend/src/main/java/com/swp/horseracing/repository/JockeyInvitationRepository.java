package com.swp.horseracing.repository;

import com.swp.horseracing.model.JockeyInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JockeyInvitationRepository extends JpaRepository<JockeyInvitation, Integer> {
    // Hỗ trợ FE lấy danh sách lời mời của 1 Nài ngựa cụ thể
    List<JockeyInvitation> findByJockeyId(Integer jockeyId);

    // Hỗ trợ FE lấy danh sách lời mời của 1 Đơn đăng ký (Để chủ ngựa theo dõi)
    List<JockeyInvitation> findByRegistrationId(Integer registrationId);

    // Hỗ trợ FE lấy danh sách lời mời của tất cả ngựa thuộc về 1 Chủ ngựa
    List<JockeyInvitation> findByRegistrationOwnerId(Integer ownerId);
}