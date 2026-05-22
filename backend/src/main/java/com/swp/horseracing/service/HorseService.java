package com.swp.horseracing.service;

import com.swp.horseracing.dto.HorseRequestDTO;
import com.swp.horseracing.dto.HorseResponseDTO;
import java.util.List;

public interface HorseService {
    HorseResponseDTO createHorse(HorseRequestDTO request);
    List<HorseResponseDTO> getAllHorses();
    List<HorseResponseDTO> getHorsesByOwnerId(Integer ownerId);
    HorseResponseDTO getHorseById(Integer id);
    HorseResponseDTO updateHorse(Integer id, HorseRequestDTO request);
    void deleteHorse(Integer id);
}