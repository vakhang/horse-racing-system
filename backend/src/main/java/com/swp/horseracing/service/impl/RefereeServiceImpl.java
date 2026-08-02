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

        // 1. Cập nhật chỉ số cho TẤT CẢ các con ngựa tham gia
        List<Registration> allRegs = registrationRepository.findByRaceId(race.getId());
        for (Registration reg : allRegs) {
            Horse h = reg.getHorse();
            h.setTotalRaces((h.getTotalRaces() != null ? h.getTotalRaces() : 0) + 1);
            if (reg.getId().equals(winningReg.getId())) {
                h.setWinRaces((h.getWinRaces() != null ? h.getWinRaces() : 0) + 1);
            }
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

        // TRUẤT QUYỀN
        registration.setStatus(RegistrationStatus.DISQUALIFIED);
        registrationRepository.save(registration);

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
}