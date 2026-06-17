package com.swp.horseracing.service;

import com.swp.horseracing.dto.InvitationRequestDTO;
import com.swp.horseracing.dto.InvitationResponseDTO;
import java.util.List;

public interface JockeyInvitationService {
    InvitationResponseDTO createInvitation(InvitationRequestDTO request);
    InvitationResponseDTO acceptInvitation(Integer id);
    InvitationResponseDTO rejectInvitation(Integer id);

    // THÊM HÀM NÀY ĐỂ LẤY DANH SÁCH
    List<InvitationResponseDTO> getInvitationsByJockeyId(Integer jockeyId);
}