package com.swp.horseracing.scheduler;

import com.swp.horseracing.model.Race;
import com.swp.horseracing.model.RaceStatus;
import com.swp.horseracing.repository.RaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
    // [Chức năng rõ ràng]: Job chạy ngầm tự động (Cronjob)
    // [Tác dụng]: Được Spring Boot gọi định kỳ mỗi 1 phút để tự động chuyển trạng thái chặng đua (Ví dụ: Từ SCHEDULED -> BETTING_OPEN khi đến giờ) mà không cần Admin thao tác tay.
    // [Hướng dẫn sửa đổi]:
    // - Logic: Nếu muốn đổi chu kỳ chạy, hãy sửa `@Scheduled(cron = "0 * * * * *")`.
public class RaceStateScheduler {

    private final RaceRepository raceRepository;
    private final com.swp.horseracing.service.RaceService raceService;

    // Chạy ngầm mỗi phút một lần
    @Scheduled(cron = "0 * * * * *")
    public void updateRaceStates() {
        LocalDateTime now = LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));

        // Tự động chuyển REGISTRATION -> BETTING khi còn 5 phút nữa tới giờ đua
        List<Race> registrationRaces = raceRepository.findByStatus(RaceStatus.REGISTRATION);
        for (Race race : registrationRaces) {
            if (race.getRaceTime() != null && now.plusMinutes(5).isAfter(race.getRaceTime())) {
                raceService.cleanupInvalidRegistrations(race.getId()); // Dọn rác
                race.setStatus(RaceStatus.BETTING);
                raceRepository.save(race);
                log.info("Auto-transitioned Race {} to BETTING", race.getId());
            }
        }

        // Tự động chuyển BETTING -> LOCK_SESSION khi chạm mốc 1 phút trước giờ chạy
        List<Race> bettingRaces = raceRepository.findByStatus(RaceStatus.BETTING);
        for (Race race : bettingRaces) {
            if (race.getRaceTime() != null && now.plusMinutes(1).isAfter(race.getRaceTime())) {
                race.setStatus(RaceStatus.LOCK_SESSION);
                raceRepository.save(race);
                log.info("Auto-transitioned Race {} to LOCK_SESSION", race.getId());
            }
        }
    }
}
