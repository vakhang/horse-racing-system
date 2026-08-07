package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.RefereeReportRequestDTO;
import com.swp.horseracing.dto.RefereeResultRequestDTO;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.*;
import com.swp.horseracing.service.RefereeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
    // [Chức năng rõ ràng]: Class Triển khai Trọng tài
    // [Tác dụng]: Nhận mảng thứ hạng (Rank) từ trọng tài, cập nhật vào bảng `registrations` để chuẩn bị cho việc trả thưởng.
    // [Hướng dẫn sửa đổi]:
    // - Logic: Thêm Validate để chặn trọng tài submit kết quả nếu có >= 2 con ngựa cùng thứ hạng (nếu luật không cho phép).
public class RefereeServiceImpl implements RefereeService {

    private final RaceRepository raceRepository;
    private final RefereeReportRepository refereeReportRepository;
    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;
    private final HorseRepository horseRepository;
    private final BetRepository betRepository;
    private final WalletRepository walletRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final AuditLogRepository auditLogRepository;
    @Override
    @Transactional
    public String submitRaceResult(RefereeResultRequestDTO request) {
        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Chặng đua!"));

        if (race.getStatus() == RaceStatus.RESULT_CONFIRMED || race.getStatus() == RaceStatus.COMPLETED) {
            throw new RuntimeException("Chặng đua này đã được chốt kết quả hoặc đã kết toán!");
        }
        race.setStatus(RaceStatus.RESULT_CONFIRMED);
        raceRepository.save(race);

        Registration winningReg = registrationRepository.findById(request.getTop1RegistrationId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký chiến thắng!"));
        
        // Lưu hạng 1 vào database
        winningReg.setRank(1);
        registrationRepository.save(winningReg);

        String resultReportStr = "Hạng 1: " + winningReg.getHorse().getName();

        if (request.getTop2RegistrationId() != null) {
            Registration top2 = registrationRepository.findById(request.getTop2RegistrationId()).orElse(null);
            if (top2 != null) {
                top2.setRank(2);
                registrationRepository.save(top2);
                resultReportStr += ", Hạng 2: " + top2.getHorse().getName();
            }
        }

        if (request.getTop3RegistrationId() != null) {
            Registration top3 = registrationRepository.findById(request.getTop3RegistrationId()).orElse(null);
            if (top3 != null) {
                top3.setRank(3);
                registrationRepository.save(top3);
                resultReportStr += ", Hạng 3: " + top3.getHorse().getName();
            }
        }

        if (request.getRefereeId() != null) {
            User referee = userRepository.findById(request.getRefereeId()).orElse(null);
            if (referee != null) {
                RefereeReport resultReport = RefereeReport.builder()
                        .race(race)
                        .registration(winningReg) // Target as winning horse
                        .referee(referee)
                        .violationDetails("[KẾT QUẢ THI ĐẤU] " + resultReportStr)
                        .build();
                refereeReportRepository.save(resultReport);
            }
        }

        // 1. Cập nhật chỉ số và điểm Rating / Cấp chạy (Class) cho TẤT CẢ các con ngựa tham gia
        List<Registration> allRegs = registrationRepository.findByRaceId(race.getId());
        for (Registration reg : allRegs) {
            Horse h = reg.getHorse();
            h.setTotalRaces((h.getTotalRaces() != null ? h.getTotalRaces() : 0) + 1);
            if (reg.getRank() != null && reg.getRank() == 1) {
                h.setWinRaces((h.getWinRaces() != null ? h.getWinRaces() : 0) + 1);
            }

            // Thuật toán V4: Cộng/Trừ điểm năng lực (Rating) sau cuộc đua
            int currentRating = h.getRating() != null ? h.getRating() : 40;
            int delta = 0;
            if (reg.getStatus() == RegistrationStatus.DISQUALIFIED) {
                delta = -3;
            } else if (reg.getRank() != null) {
                if (reg.getRank() == 1) delta = 8;
                else if (reg.getRank() == 2) delta = 4;
                else if (reg.getRank() == 3) delta = 2;
                else if (reg.getRank() == 4 || reg.getRank() == 5) delta = 0;
                else if (reg.getRank() >= 6) delta = -1;
            }

            int newRating = Math.max(0, currentRating + delta);
            h.setRating(newRating);

            // Tự động thăng hạng / xuống hạng (Class 1 -> Class 5)
            int newClass = 5;
            if (newRating >= 95) newClass = 1;
            else if (newRating >= 80) newClass = 2;
            else if (newRating >= 60) newClass = 3;
            else if (newRating >= 40) newClass = 4;
            else newClass = 5;

            h.setClassLevel(newClass);
            horseRepository.save(h);
        }

        return "Trọng tài đã chốt kết quả thành công! Hệ thống đang chờ Admin tiến hành kết toán trả thưởng.";
    }


    @Override
    public String submitReport(RefereeReportRequestDTO request) {
        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Race not found"));
        User referee = userRepository.findById(request.getRefereeId())
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        Registration registration = registrationRepository.findById(request.getRegistrationId())
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        // TRUẤT QUYỀN & TRỪ 3 ĐIỂM RATING
        registration.setStatus(RegistrationStatus.DISQUALIFIED);
        registrationRepository.save(registration);

        Horse h = registration.getHorse();
        if (h != null) {
            int newRating = Math.max(0, (h.getRating() != null ? h.getRating() : 40) - 3);
            h.setRating(newRating);
            int newClass = 5;
            if (newRating >= 95) newClass = 1;
            else if (newRating >= 80) newClass = 2;
            else if (newRating >= 60) newClass = 3;
            else if (newRating >= 40) newClass = 4;
            else newClass = 5;
            h.setClassLevel(newClass);
            horseRepository.save(h);
        }

        // TÌM TẤT CẢ VÉ CƯỢC CỦA NGỰA BỊ TRUẤT QUYỀN VÀ CHUYỂN THÀNH LOST
        List<Bet> bets = betRepository.findByRaceId(race.getId());
        for (Bet bet : bets) {
            if (bet.getRegistration().getId().equals(registration.getId()) && bet.getStatus() == BetStatus.PENDING) {
                bet.setStatus(BetStatus.LOST);
                betRepository.save(bet);
            }
        }

        RefereeReport report = RefereeReport.builder()
                .race(race)
                .referee(referee)
                .registration(registration)
                .violationDetails(request.getViolationDetails())
                .build();

        refereeReportRepository.save(report);

        return "Lập biên bản và truất quyền thi đấu thành công!";
    }

    @Override
    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getAllReports() {
        return refereeReportRepository.findAll().stream().map(report -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", report.getId());
            map.put("raceName", report.getRace().getName());
            map.put("target", report.getRegistration().getHorse().getName());
            map.put("refereeName", report.getReferee().getUsername());
            map.put("date", report.getCreatedAt().toString());
            
            String details = report.getViolationDetails();
            String penalty = "Vi phạm";
            String reason = details;
            
            if (details != null && details.startsWith("[")) {
                int closingIndex = details.indexOf("]");
                if (closingIndex > 0) {
                    penalty = details.substring(1, closingIndex);
                    reason = details.substring(closingIndex + 1).trim();
                }
            }
            
            map.put("penalty", penalty);
            map.put("reason", reason);
            
            return map;
        }).sorted((a, b) -> ((String)b.get("date")).compareTo((String)a.get("date"))).toList();
    }

    @Override
    @Transactional
    public String declareNonStarter(com.swp.horseracing.dto.RefereeNonStarterRequestDTO request) {
        Race race = raceRepository.findByIdWithPessimisticWrite(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Chặng đua!"));

        User referee = userRepository.findById(request.getRefereeId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Trọng tài!"));

        Registration registration = registrationRepository.findById(request.getRegistrationId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Suất đăng ký!"));

        registration.setStatus(RegistrationStatus.NON_STARTER);
        registrationRepository.save(registration);

        List<Bet> bets = betRepository.findByRaceId(race.getId());
        int affectedBetsCount = 0;
        java.math.BigDecimal totalRefund = java.math.BigDecimal.ZERO;

        for (Bet bet : bets) {
            if (bet.getStatus() == BetStatus.PENDING) {
                boolean shouldRefund = false;
                
                if (bet.getBetType() == BetType.WIN || bet.getBetType() == BetType.PLACE) {
                    if (bet.getRegistration().getId().equals(registration.getId())) {
                        shouldRefund = true;
                    }
                } else if (bet.getBetType() == BetType.QUINELLA || bet.getBetType() == BetType.EXACTA) {
                    if (bet.getRegistration().getId().equals(registration.getId()) || 
                        (bet.getRegistration2() != null && bet.getRegistration2().getId().equals(registration.getId()))) {
                        shouldRefund = true;
                    }
                }

                if (shouldRefund) {
                    bet.setStatus(BetStatus.REFUNDED);
                    betRepository.save(bet);

                    Wallet wallet = walletRepository.findByUserId(bet.getSpectator().getId()).orElse(null);
                    if (wallet != null) {
                        wallet.setBalance(wallet.getBalance().add(bet.getAmount()));
                        walletRepository.save(wallet);

                        TransactionHistory tx = TransactionHistory.builder()
                                .transactionCode("REFUND-NS-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                                .wallet(wallet)
                                .amount(bet.getAmount())
                                .type(TransactionType.REFUND)
                                .direction(TransactionDirection.IN)
                                .status(TransactionStatus.COMPLETED)
                                .build();
                        transactionHistoryRepository.save(tx);
                        
                        totalRefund = totalRefund.add(bet.getAmount());
                        affectedBetsCount++;
                    }
                }
            }
        }

        if (totalRefund.compareTo(java.math.BigDecimal.ZERO) > 0) {
            race.setTotalPool(race.getTotalPool().subtract(totalRefund));
            raceRepository.save(race);
        }

        try {
            String detailsJson = String.format("{\"performedBy\":\"%s\",\"entityName\":\"%s\",\"entityId\":%d,\"gateNumber\":%d,\"affectedBetsCount\":%d,\"totalRefundAmount\":%s,\"timestamp\":\"%s\"}",
                "referee_id_" + referee.getId(),
                "Registration",
                registration.getId(),
                registration.getGateNumber(),
                affectedBetsCount,
                totalRefund.toString(),
                java.time.format.DateTimeFormatter.ISO_INSTANT.format(java.time.Instant.now())
            );

            AuditLog log = AuditLog.builder()
                    .action("NON_STARTER_REPORT")
                    .performedBy(referee.getUsername())
                    .entityName("Registration")
                    .entityId(String.valueOf(registration.getId()))
                    .reason(detailsJson)
                    .affectedBetsCount(affectedBetsCount)
                    .totalRefundAmount(totalRefund)
                    .build();
            auditLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Failed to write Audit Log JSON: " + e.getMessage());
        }

        return "Đã ghi nhận sự cố NON_STARTER. Hệ thống đã hoàn tiền " + totalRefund + " VNĐ cho " + affectedBetsCount + " vé cược và cấu trúc lại bể cược.";
    }

    private double calculateAssignedWeightKg(int rating, int classLevel) {
        int floorRating = 0;
        if (classLevel == 1) floorRating = 95;
        else if (classLevel == 2) floorRating = 80;
        else if (classLevel == 3) floorRating = 60;
        else if (classLevel == 4) floorRating = 40;
        else floorRating = 0;

        int deltaRating = Math.max(0, rating - floorRating);
        double assignedWeightLb = 115.0 + (deltaRating * 0.5);
        double assignedWeightKg = assignedWeightLb * 0.45359237;
        return Math.round(assignedWeightKg * 10.0) / 10.0;
    }

    @Override
    @Transactional
    public com.swp.horseracing.dto.RegistrationResponseDTO recordWeighIn(com.swp.horseracing.dto.RefereeWeighingRequestDTO request) {
        Registration reg = registrationRepository.findById(request.getRegistrationId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Đơn đăng ký ID: " + request.getRegistrationId()));

        int rating = reg.getHorse() != null && reg.getHorse().getRating() != null ? reg.getHorse().getRating() : 40;
        int classLevel = reg.getHorse() != null && reg.getHorse().getClassLevel() != null ? reg.getHorse().getClassLevel() : 4;
        
        double assignedKg = reg.getAssignedWeight() != null ? reg.getAssignedWeight() : calculateAssignedWeightKg(rating, classLevel);
        double actualKg = request.getActualWeight();
        double leadKg = Math.max(0.0, Math.round((assignedKg - actualKg) * 10.0) / 10.0);

        reg.setAssignedWeight(assignedKg);
        reg.setActualWeight(actualKg);
        reg.setLeadWeight(leadKg);
        reg.setIsWeighedIn(true);
        registrationRepository.save(reg);

        Double jockeyKg = (reg.getJockey() != null && reg.getJockey().getWeight() != null) ? reg.getJockey().getWeight() : null;

        return com.swp.horseracing.dto.RegistrationResponseDTO.builder()
                .id(reg.getId())
                .raceId(reg.getRace() != null ? reg.getRace().getId() : null)
                .raceName(reg.getRace() != null ? reg.getRace().getName() : null)
                .horseId(reg.getHorse() != null ? reg.getHorse().getId() : null)
                .horseName(reg.getHorse() != null ? reg.getHorse().getName() : null)
                .ownerId(reg.getOwner() != null ? reg.getOwner().getId() : null)
                .ownerUsername(reg.getOwner() != null ? reg.getOwner().getUsername() : null)
                .jockeyId(reg.getJockey() != null ? reg.getJockey().getId() : null)
                .jockeyUsername(reg.getJockey() != null ? reg.getJockey().getUsername() : null)
                .status(reg.getStatus())
                .note(reg.getNote())
                .finishPosition(reg.getRank())
                .gateNumber(reg.getGateNumber())
                .assignedWeight(assignedKg)
                .actualWeight(actualKg)
                .leadWeight(leadKg)
                .isWeighedIn(true)
                .jockeyWeight(jockeyKg)
                .build();
    }
}