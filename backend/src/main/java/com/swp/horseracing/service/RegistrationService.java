package com.swp.horseracing.service;

import com.swp.horseracing.dto.RegistrationRequestDTO;
import com.swp.horseracing.dto.RegistrationResponseDTO;
import java.util.List;

public interface RegistrationService {
    RegistrationResponseDTO createRegistration(RegistrationRequestDTO request);
    List<RegistrationResponseDTO> getAllRegistrations();
    List<RegistrationResponseDTO> getRegistrationsByRaceId(Integer raceId);
    List<RegistrationResponseDTO> getRegistrationsByOwnerId(Integer ownerId);
    List<RegistrationResponseDTO> getRegistrationsByJockeyId(Integer jockeyId);
    RegistrationResponseDTO getRegistrationById(Integer id);
    RegistrationResponseDTO updateRegistration(Integer id, RegistrationRequestDTO request);
    void deleteRegistration(Integer id);
}