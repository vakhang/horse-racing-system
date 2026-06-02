package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.InvitationRequestDTO;
import com.swp.horseracing.dto.InvitationResponseDTO;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.*;
import com.swp.horseracing.service.JockeyInvitationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class JockeyInvitationServiceImpl implements JockeyInvitationService {

    private final JockeyInvitationRepository invitationRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public InvitationResponseDTO createInvitation(InvitationRequestDTO request) {
        Registration reg = registrationRepository.findById(request.getRegistrationId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Đơn đăng ký!"));

        User jockey = userRepository.findById(request.getJockeyId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nài ngựa!"));

        if (jockey.getRole() != RoleEnum.JOCKEY) {
            throw new RuntimeException("Người dùng này không phải Nài ngựa!");
        }

        JockeyInvitation invitation = JockeyInvitation.builder()
                .registration(reg)
                .jockey(jockey)
                .status(InvitationStatus.PENDING)
                .build();

        return mapToDTO(invitationRepository.save(invitation));
    }

    @Override
    @Transactional
    public InvitationResponseDTO acceptInvitation(Integer id) {
        JockeyInvitation invitation = invitationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lời mời!"));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Lời mời này đã được xử lý trước đó!");
        }

        // RÀNG BUỘC: Kiểm tra trùng giờ
        Registration currentReg = invitation.getRegistration();
        java.time.LocalDateTime currentRaceTime = currentReg.getRace().getRaceTime();
        
        java.util.List<Registration> overlappingRegs = registrationRepository.findByJockeyAndRaceTime(
                invitation.getJockey().getId(), currentRaceTime);
        
        if (!overlappingRegs.isEmpty()) {
            throw new RuntimeException("Bạn đã nhận một chặng đua khác diễn ra cùng giờ!");
        }

        // 1. Cập nhật thiệp mời
        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setRespondedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        // 2. Cập nhật Đơn đăng ký bằng trạng thái chuẩn của DB
        Registration reg = invitation.getRegistration();
        reg.setJockey(invitation.getJockey());
        reg.setStatus(RegistrationStatus.PENDING_APPROVAL);
        registrationRepository.save(reg);

        return mapToDTO(invitation);
    }

    @Override
    @Transactional
    public InvitationResponseDTO rejectInvitation(Integer id) {
        JockeyInvitation invitation = invitationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lời mời!"));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Lời mời này đã được xử lý trước đó!");
        }

        invitation.setStatus(InvitationStatus.REJECTED);
        invitation.setRespondedAt(LocalDateTime.now());

        return mapToDTO(invitationRepository.save(invitation));
    }

    private InvitationResponseDTO mapToDTO(JockeyInvitation inv) {
        return InvitationResponseDTO.builder()
                .id(inv.getId())
                .registrationId(inv.getRegistration().getId())
                .raceName(inv.getRegistration().getRace().getName())
                .horseName(inv.getRegistration().getHorse().getName())
                .jockeyId(inv.getJockey().getId())
                .jockeyUsername(inv.getJockey().getUsername())
                .status(inv.getStatus())
                .invitedAt(inv.getInvitedAt())
                .respondedAt(inv.getRespondedAt())
                .build();
    }
}