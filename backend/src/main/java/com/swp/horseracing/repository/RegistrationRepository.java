package com.swp.horseracing.repository;

import com.swp.horseracing.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

public interface RegistrationRepository extends JpaRepository<Registration, Integer> {
    List<Registration> findByRaceId(Integer raceId);
    List<Registration> findByOwnerId(Integer ownerId);
    List<Registration> findByJockeyId(Integer jockeyId);
}