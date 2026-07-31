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

        // RÀNG BUỘC PHÁP LÝ (Nghị định 06/2017/NĐ-CP): Nài ngựa phải có đủ hồ sơ sức khỏe và chứng chỉ
        User jockey = invitation.getJockey();
        if (jockey.getWeight() == null || jockey.getWeight() <= 0 || jockey.getHeight() == null || jockey.getHeight() <= 0) {
            throw new RuntimeException("Bạn chưa cập nhật Chiều cao và Cân nặng trong hồ sơ. Vui lòng bổ sung để nhận lời mời đua!");
        }

        boolean hasJockeyCert = jockey.getAttachments().stream().anyMatch(a -> a.getDocType() == com.swp.horseracing.model.UserDocType.JOCKEY_CERT);
        boolean hasHealthCheck = jockey.getAttachments().stream().anyMatch(a -> a.getDocType() == com.swp.horseracing.model.UserDocType.HEALTH_CHECK);

        if (!hasJockeyCert || !hasHealthCheck) {
            throw new RuntimeException("Bạn chưa bổ sung đủ Bằng cấp hoặc Giấy khám sức khỏe. Vui lòng cập nhật hồ sơ để nhận lời mời đua!");
        }

        // RÀNG BUỘC: Kiểm tra trùng giờ (Overlapping) bằng công thức (startA < endB) AND (startB < endA)
        Registration currentReg = invitation.getRegistration();
        java.time.LocalDateTime startB = currentReg.getRace().getRaceTime();
        Integer durationB = currentReg.getRace().getEstimatedDuration() != null ? currentReg.getRace().getEstimatedDuration() : 30;
        java.time.LocalDateTime endB = startB.plusMinutes(durationB);

        java.util.List<Registration> allJockeyRegs = registrationRepository.findByJockeyId(invitation.getJockey().getId());

        boolean isOverlapping = allJockeyRegs.stream()
                .filter(r -> r.getStatus() == RegistrationStatus.PENDING_APPROVAL || r.getStatus() == RegistrationStatus.APPROVED_BY_ADMIN)
                .anyMatch(r -> {
                    java.time.LocalDateTime startA = r.getRace().getRaceTime();
                    Integer durationA = r.getRace().getEstimatedDuration() != null ? r.getRace().getEstimatedDuration() : 30;
                    java.time.LocalDateTime endA = startA.plusMinutes(durationA);
                    
                    return startA.isBefore(endB) && startB.isBefore(endA);
                });

        if (isOverlapping) {
            throw new RuntimeException("Bạn đã nhận một chặng đua khác diễn ra cùng giờ! Không thể Double-Booking.");
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
    @Override
    public java.util.List<InvitationResponseDTO> getInvitationsByJockeyId(Integer jockeyId) {
        return invitationRepository.findByJockeyId(jockeyId).stream()
                .map(this::mapToDTO)
                .collect(java.util.stream.Collectors.toList());
    }
}