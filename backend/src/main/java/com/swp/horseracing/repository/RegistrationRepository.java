package com.swp.horseracing.repository;

import com.swp.horseracing.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RegistrationRepository extends JpaRepository<Registration, Integer> {
    List<Registration> findByRaceId(Integer raceId);

    List<Registration> findByOwnerId(Integer ownerId);

    List<Registration> findByJockeyId(Integer jockeyId);

    @Query("SELECT r FROM Registration r WHERE r.jockey.id = :jockeyId AND r.race.raceTime = :raceTime")
    List<Registration> findByJockeyAndRaceTime(@Param("jockeyId") Integer jockeyId,
            @Param("raceTime") LocalDateTime raceTime);
}
