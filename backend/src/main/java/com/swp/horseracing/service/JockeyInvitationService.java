package com.swp.horseracing.service;

import com.swp.horseracing.dto.InvitationRequestDTO;
import com.swp.horseracing.dto.InvitationResponseDTO;
import java.util.List;

    // [Chức năng rõ ràng]: Interface Service Lời mời Nài Ngựa
    // [Tác dụng]: Định nghĩa luồng Gửi - Nhận - Từ chối - Hủy lời mời.
    // [Hướng dẫn sửa đổi]:
    // - Logic: Thêm khai báo hàm đếm lời mời chưa đọc.
public interface JockeyInvitationService {
    InvitationResponseDTO createInvitation(InvitationRequestDTO request);
    InvitationResponseDTO acceptInvitation(Integer id);
    InvitationResponseDTO rejectInvitation(Integer id);

    // THÊM HÀM NÀY ĐỂ LẤY DANH SÁCH
    List<InvitationResponseDTO> getInvitationsByJockeyId(Integer jockeyId);
    List<InvitationResponseDTO> getInvitationsByOwnerId(Integer ownerId);

    // THÊM HÀM HỦY LỜI MỜI CHO CHỦ NGỰA
    InvitationResponseDTO cancelInvitation(Integer id);
}