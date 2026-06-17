package com.swp.horseracing.service;

import com.swp.horseracing.dto.TournamentRequestDTO;
import com.swp.horseracing.dto.TournamentResponseDTO;
import java.util.List;

public interface TournamentService {
    TournamentResponseDTO createTournament(TournamentRequestDTO request);
    List<TournamentResponseDTO> getAllTournaments();
    TournamentResponseDTO getTournamentById(Integer id);
    TournamentResponseDTO updateTournament(Integer id, TournamentRequestDTO request);
    void deleteTournament(Integer id);

    // THÊM DÒNG NÀY:
    void cancelTournament(Integer id);
}