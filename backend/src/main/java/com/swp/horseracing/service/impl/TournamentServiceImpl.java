package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.TournamentRequestDTO;
import com.swp.horseracing.dto.TournamentResponseDTO;
import com.swp.horseracing.model.Tournament;
import com.swp.horseracing.model.TournamentStatus;
import com.swp.horseracing.repository.TournamentRepository;
import com.swp.horseracing.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TournamentServiceImpl implements TournamentService {

    private final TournamentRepository tournamentRepository;

    @Override
    @Transactional
    public TournamentResponseDTO createTournament(TournamentRequestDTO request) {
        if (tournamentRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tên giải đấu này đã tồn tại!");
        }

        Tournament tournament = Tournament.builder()
                .name(request.getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus() != null ? request.getStatus() : TournamentStatus.UPCOMING)
                .build();

        return mapToResponseDTO(tournamentRepository.save(tournament));
    }

    @Override
    public List<TournamentResponseDTO> getAllTournaments() {
        return tournamentRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TournamentResponseDTO getTournamentById(Integer id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Giải đấu với ID: " + id));
        return mapToResponseDTO(tournament);
    }

    @Override
    @Transactional
    public TournamentResponseDTO updateTournament(Integer id, TournamentRequestDTO request) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Giải đấu với ID: " + id));

        if (request.getName() != null && !tournament.getName().equals(request.getName())
                && tournamentRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tên giải đấu này đã tồn tại!");
        }

        if (request.getName() != null) tournament.setName(request.getName());
        if (request.getStartDate() != null) tournament.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) tournament.setEndDate(request.getEndDate());
        if (request.getStatus() != null) tournament.setStatus(request.getStatus());

        return mapToResponseDTO(tournamentRepository.save(tournament));
    }

    @Override
    @Transactional
    public void deleteTournament(Integer id) {
        if (!tournamentRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy Giải đấu với ID: " + id);
        }
        tournamentRepository.deleteById(id);
    }

    private TournamentResponseDTO mapToResponseDTO(Tournament tournament) {
        return TournamentResponseDTO.builder()
                .id(tournament.getId())
                .name(tournament.getName())
                .startDate(tournament.getStartDate())
                .endDate(tournament.getEndDate())
                .status(tournament.getStatus())
                .build();
    }
}