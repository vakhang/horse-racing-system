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
public class RaceStateScheduler {

    private final RaceRepository raceRepository;

    // Chạy ngầm mỗi phút một lần
    @Scheduled(cron = "0 * * * * *")
    public void updateRaceStates() {
        LocalDateTime now = LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));

        // Tự động chuyển REGISTRATION -> BETTING khi chạm mốc 12 giờ trước giờ chạy
        List<Race> registrationRaces = raceRepository.findByStatus(RaceStatus.REGISTRATION);
        for (Race race : registrationRaces) {
            if (race.getRaceTime() != null && now.plusMinutes(5).isAfter(race.getRaceTime())) {
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
