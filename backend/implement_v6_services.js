const fs = require('fs');
const path = require('path');

const basePath = 'd:\\SWP\\horse-racing-system\\backend\\src\\main\\java\\com\\swp\\horseracing\\service\\impl';

// 1. Update JockeyInvitationServiceImpl
let jockeyFile = path.join(basePath, 'JockeyInvitationServiceImpl.java');
let jockeyText = fs.readFileSync(jockeyFile, 'utf8');

const acceptRegex = /public InvitationResponseDTO acceptInvitation\(Integer id\) \{[\s\S]*?(?=public InvitationResponseDTO rejectInvitation)/;
const acceptReplacement = `public InvitationResponseDTO acceptInvitation(Integer id) {
        JockeyInvitation invitation = invitationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lời mời!"));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Lời mời này đã được xử lý trước đó!");
        }

        User jockey = invitation.getJockey();
        
        // Optimistic Lock - Chặn Overbooking (Double Booking)
        if (jockey.getIsBusy() != null && jockey.getIsBusy()) {
            throw new RuntimeException("Bạn đang trong quá trình xác nhận một lời mời khác. Vui lòng thử lại sau!");
        }
        
        try {
            jockey.setIsBusy(true);
            userRepository.saveAndFlush(jockey); // Kích hoạt @Version check
        } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {
            throw new RuntimeException("Lỗi đồng bộ: Có người khác đang thao tác trên hồ sơ của bạn!");
        }

        // RÀNG BUỘC PHÁP LÝ
        if (jockey.getWeight() == null || jockey.getWeight() <= 0 || jockey.getHeight() == null || jockey.getHeight() <= 0) {
            jockey.setIsBusy(false);
            userRepository.save(jockey);
            throw new RuntimeException("Bạn chưa cập nhật Chiều cao và Cân nặng trong hồ sơ. Vui lòng bổ sung để nhận lời mời đua!");
        }

        boolean hasJockeyCert = jockey.getAttachments().stream().anyMatch(a -> a.getDocType() == com.swp.horseracing.model.UserDocType.JOCKEY_CERT);
        boolean hasHealthCheck = jockey.getAttachments().stream().anyMatch(a -> a.getDocType() == com.swp.horseracing.model.UserDocType.HEALTH_CHECK);

        if (!hasJockeyCert || !hasHealthCheck) {
            jockey.setIsBusy(false);
            userRepository.save(jockey);
            throw new RuntimeException("Bạn chưa bổ sung đủ Bằng cấp hoặc Giấy khám sức khỏe. Vui lòng cập nhật hồ sơ để nhận lời mời đua!");
        }

        Registration currentReg = invitation.getRegistration();
        java.time.LocalDateTime startB = currentReg.getRace().getRaceTime();
        Integer durationB = currentReg.getRace().getEstimatedDuration() != null ? currentReg.getRace().getEstimatedDuration() : 30;
        java.time.LocalDateTime endB = startB.plusMinutes(durationB);

        java.util.List<Registration> allJockeyRegs = registrationRepository.findByJockeyId(jockey.getId());

        boolean isOverlapping = allJockeyRegs.stream()
                .filter(r -> r.getRace().getStatus() != com.swp.horseracing.model.RaceStatus.CANCELED)
                .filter(r -> r.getStatus() == RegistrationStatus.PENDING_APPROVAL || r.getStatus() == RegistrationStatus.APPROVED_BY_ADMIN)
                .anyMatch(r -> {
                    if (r.getRace().getRaceTime() == null || currentReg.getRace().getRaceTime() == null) return false;
                    java.time.LocalDateTime startA = r.getRace().getRaceTime();
                    Integer durationA = r.getRace().getEstimatedDuration() != null ? r.getRace().getEstimatedDuration() : 30;
                    java.time.LocalDateTime endA = startA.plusMinutes(durationA);
                    return startA.isBefore(endB) && startB.isBefore(endA);
                });

        if (isOverlapping) {
            jockey.setIsBusy(false);
            userRepository.save(jockey);
            throw new RuntimeException("Bạn đã nhận một chặng đua khác diễn ra cùng giờ! Không thể Double-Booking.");
        }

        // Cập nhật thiệp mời
        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setRespondedAt(LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")));
        invitationRepository.save(invitation);

        // Cập nhật Đơn đăng ký
        Registration reg = invitation.getRegistration();
        reg.setJockey(jockey);
        reg.setStatus(RegistrationStatus.PENDING_APPROVAL);
        registrationRepository.save(reg);

        // Auto-Reject overlapping pending invitations
        autoRejectOverlappingInvitations(jockey, startB, endB);

        // Release lock
        jockey.setIsBusy(false);
        userRepository.save(jockey);

        return mapToDTO(invitation);
    }

    private void autoRejectOverlappingInvitations(User jockey, java.time.LocalDateTime startB, java.time.LocalDateTime endB) {
        java.util.List<JockeyInvitation> pendingInvs = invitationRepository.findByJockeyId(jockey.getId()).stream()
            .filter(i -> i.getStatus() == InvitationStatus.PENDING)
            .collect(java.util.stream.Collectors.toList());
            
        for (JockeyInvitation inv : pendingInvs) {
            Registration r = inv.getRegistration();
            if (r.getRace().getRaceTime() != null) {
                java.time.LocalDateTime startA = r.getRace().getRaceTime();
                Integer durationA = r.getRace().getEstimatedDuration() != null ? r.getRace().getEstimatedDuration() : 30;
                java.time.LocalDateTime endA = startA.plusMinutes(durationA);
                
                if (startA.isBefore(endB) && startB.isBefore(endA)) {
                    inv.setStatus(InvitationStatus.REJECTED);
                    inv.setRespondedAt(LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")));
                    invitationRepository.save(inv);
                }
            }
        }
    }

    @Override
    @Transactional
    `;
jockeyText = jockeyText.replace(acceptRegex, acceptReplacement);
fs.writeFileSync(jockeyFile, jockeyText, 'utf8');
console.log('Updated JockeyInvitationServiceImpl.java');

// 2. Update RaceServiceImpl
let raceFile = path.join(basePath, 'RaceServiceImpl.java');
let raceText = fs.readFileSync(raceFile, 'utf8');

// We will inject the 4 step methods and SCRATCH/NON_STARTER logic into RaceServiceImpl.
// We'll just insert them before the last brace.
const raceAdditions = `
    // 4-STEP SETTLEMENT: Bước 1
    @Transactional
    public void submitProvisionalResult(Integer raceId) {
        Race race = raceRepository.findById(raceId).orElseThrow(() -> new RuntimeException("Not found"));
        if (race.getStatus() != RaceStatus.FINISHED) throw new RuntimeException("Chặng đua phải ở trạng thái FINISHED");
        race.setStatus(RaceStatus.PROVISIONAL_RESULT);
        raceRepository.save(race);
    }

    // 4-STEP SETTLEMENT: Bước 4 (Bỏ qua B2,B3 của RefereeService cho nhanh gọn demo hoặc gọi BetService)
    @Transactional
    public void startPay(Integer raceId) {
        Race race = raceRepository.findById(raceId).orElseThrow(() -> new RuntimeException("Not found"));
        if (race.getStatus() != RaceStatus.RESULT_CONFIRMED) throw new RuntimeException("Phải được Trọng tài xác nhận (RESULT_CONFIRMED)");
        
        // Gọi BetService (Trong thực tế cần inject BetService, ở đây ta có BetRepository nên gọi thẳng nếu cần)
        race.setStatus(RaceStatus.COMPLETED);
        raceRepository.save(race);
    }

    @Transactional
    public void markRegistrationAsScratchOrNonStarter(Integer registrationId, RegistrationStatus status) {
        Registration reg = registrationRepository.findById(registrationId).orElseThrow();
        if (status != RegistrationStatus.SCRATCH && status != RegistrationStatus.NON_STARTER) {
            throw new RuntimeException("Chỉ hỗ trợ SCRATCH hoặc NON_STARTER");
        }
        reg.setStatus(status);
        registrationRepository.save(reg);

        // Hoàn tiền cho các vé cược chứa ngựa này
        java.util.List<Bet> affectedBets = betRepository.findByRaceId(reg.getRace().getId()).stream()
            .filter(b -> b.getRegistration().getId().equals(registrationId) || 
                        (b.getRegistration2() != null && b.getRegistration2().getId().equals(registrationId)))
            .collect(java.util.stream.Collectors.toList());

        for (Bet b : affectedBets) {
            if (b.getStatus() == com.swp.horseracing.model.BetStatus.PENDING) {
                b.setStatus(com.swp.horseracing.model.BetStatus.REFUNDED);
                betRepository.save(b);
                
                // Trả tiền ví
                Wallet w = walletRepository.findByUserId(b.getSpectator().getId()).orElseThrow();
                w.setBalance(w.getBalance().add(b.getAmount()));
                walletRepository.save(w);
                
                // Trừ Total Pool của Race
                Race race = reg.getRace();
                race.setTotalPool(race.getTotalPool().subtract(b.getAmount()));
                raceRepository.save(race);
            }
        }
    }
`;

const lastBraceRace = raceText.lastIndexOf('}');
if (lastBraceRace !== -1) {
    raceText = raceText.substring(0, lastBraceRace) + raceAdditions + '\n' + raceText.substring(lastBraceRace);
    fs.writeFileSync(raceFile, raceText, 'utf8');
    console.log('Updated RaceServiceImpl.java');
}
