package com.swp.horseracing.service;

import com.swp.horseracing.dto.InvitationRequestDTO;
import com.swp.horseracing.dto.InvitationResponseDTO;

public interface JockeyInvitationService {

    // Chủ ngựa tạo lời mời
    InvitationResponseDTO createInvitation(InvitationRequestDTO request);

    // Nài ngựa đồng ý (Tự động đắp vào Đơn đăng ký)
    InvitationResponseDTO acceptInvitation(Integer id);

    // Nài ngựa từ chối
    InvitationResponseDTO rejectInvitation(Integer id);
}