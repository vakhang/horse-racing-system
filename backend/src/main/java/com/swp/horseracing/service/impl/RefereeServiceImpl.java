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
public class RefereeServiceImpl implements RefereeService {

    private final RaceRepository raceRepository;
    private final RefereeReportRepository refereeReportRepository;
    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;
    private final HorseRepository horseRepository;

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

        RefereeReport report = RefereeReport.builder()
                .race(race)
                .referee(referee)
                .registration(registration)
                .violationDetails(request.getViolationDetails())
                .build();

        refereeReportRepository.save(report);

        return "Lập biên bản vi phạm thành công!";
    }
}