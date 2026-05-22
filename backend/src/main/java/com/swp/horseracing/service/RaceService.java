package com.swp.horseracing.service;

import com.swp.horseracing.dto.RaceRequestDTO;
import com.swp.horseracing.dto.RaceResponseDTO;

import java.util.List;

public interface RaceService {
    RaceResponseDTO createRace(RaceRequestDTO request);
    List<RaceResponseDTO> getAllRaces();
    List<RaceResponseDTO> getRacesByTournamentId(Integer tournamentId);
    RaceResponseDTO getRaceById(Integer id);
    RaceResponseDTO updateRace(Integer id, RaceRequestDTO request);
    void deleteRace(Integer id);
}