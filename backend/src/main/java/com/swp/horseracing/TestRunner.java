package com.swp.horseracing;

import com.swp.horseracing.dto.RaceRequestDTO;
import com.swp.horseracing.service.RaceService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class TestRunner implements CommandLineRunner {

    private final RaceService raceService;

    public TestRunner(RaceService raceService) {
        this.raceService = raceService;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            RaceRequestDTO dto = new RaceRequestDTO();
            dto.setTournamentId(13);
            dto.setName("Test from Java");
            dto.setRaceTime(LocalDateTime.now().plusDays(1));
            dto.setPrize1(new BigDecimal("100"));
            dto.setPrize2(new BigDecimal("50"));
            dto.setPrize3(new BigDecimal("20"));
            
            raceService.createRace(dto);
            System.out.println("SUCCESSFULLY CREATED RACE");
        } catch (Exception e) {
            e.printStackTrace();
        }
        System.exit(0);
    }
}
