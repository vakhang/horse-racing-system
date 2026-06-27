package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.LiveOddsResponseDTO;
import com.swp.horseracing.dto.RaceRequestDTO;
import com.swp.horseracing.dto.RaceResponseDTO;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.BetRepository;
import com.swp.horseracing.repository.RaceRepository;
import com.swp.horseracing.repository.RegistrationRepository;
import com.swp.horseracing.repository.TournamentRepository;
import com.swp.horseracing.repository.UserRepository;
import com.swp.horseracing.service.RaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RaceServiceImpl implements RaceService {

    private final RaceRepository raceRepository;
    private final TournamentRepository tournamentRepository;
    private final RegistrationRepository registrationRepository;
    private final BetRepository betRepository;
    private final UserRepository userRepository; // Tiêm vào để tìm Trọng tài

    @Override
    @Transactional
    public RaceResponseDTO createRace(RaceRequestDTO request) {
        Tournament tournament = tournamentRepository.findById(request.getTournamentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Giải đấu với ID: " + request.getTournamentId()));

        User referee = null;
        if (request.getRefereeId() != null) {
            referee = userRepository.findById(request.getRefereeId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Trọng tài!"));
        }

        Race race = Race.builder()
                .tournament(tournament)
                .name(request.getName())
                .raceTime(request.getRaceTime())
                .status(request.getStatus() != null ? request.getStatus() : RaceStatus.PENDING)
                .referee(referee)
                .prize1(request.getPrize1())
                .prize2(request.getPrize2())
                .prize3(request.getPrize3())
                .build();

        return mapToResponseDTO(raceRepository.save(race));
    }

    @Override
    public List<RaceResponseDTO> getAllRaces() {
        return raceRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RaceResponseDTO> getRacesByTournamentId(Integer tournamentId) {
        return raceRepository.findByTournamentId(tournamentId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RaceResponseDTO getRaceById(Integer id) {
        Race race = raceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Chặng đua với ID: " + id));
        return mapToResponseDTO(race);
    }

    @Override
    @Transactional
    public RaceResponseDTO updateRace(Integer id, RaceRequestDTO request) {
        Race race = raceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Chặng đua với ID: " + id));

        if (request.getTournamentId() != null && !race.getTournament().getId().equals(request.getTournamentId())) {
            Tournament newTournament = tournamentRepository.findById(request.getTournamentId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Giải đấu mới với ID: " + request.getTournamentId()));
            race.setTournament(newTournament);
        }

        if (request.getName() != null) race.setName(request.getName());
        if (request.getRaceTime() != null) race.setRaceTime(request.getRaceTime());

        if (request.getRefereeId() != null) {
            User referee = userRepository.findById(request.getRefereeId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Trọng tài!"));
            race.setReferee(referee);
        }
        if (request.getPrize1() != null) race.setPrize1(request.getPrize1());
        if (request.getPrize2() != null) race.setPrize2(request.getPrize2());
        if (request.getPrize3() != null) race.setPrize3(request.getPrize3());

        if (request.getStatus() != null) {
            // Chốt tỷ lệ cược khi Trọng tài ấn Bắt đầu đua (PENDING -> RUNNING)
            if (race.getStatus() == RaceStatus.PENDING && request.getStatus() == RaceStatus.RUNNING) {
                List<LiveOddsResponseDTO> finalOdds = this.getLiveOdds(id);
                List<Bet> bets = betRepository.findByRaceId(id);

                for (Bet bet : bets) {
                    java.math.BigDecimal odds = finalOdds.stream()
                            .filter(o -> o.getRegistrationId().equals(bet.getRegistration().getId()))
                            .findFirst()
                            .map(LiveOddsResponseDTO::getCalculatedOdds)
                            .orElse(java.math.BigDecimal.ZERO);
                    bet.setOdds(odds);
                    betRepository.save(bet);
                }
            }
            race.setStatus(request.getStatus());
        }

        return mapToResponseDTO(raceRepository.save(race));
    }

    @Override
    @Transactional
    public void deleteRace(Integer id) {
        if (!raceRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy Chặng đua với ID: " + id);
        }
        raceRepository.deleteById(id);
    }

    private RaceResponseDTO mapToResponseDTO(Race race) {
        return RaceResponseDTO.builder()
                .id(race.getId())
                .tournamentId(race.getTournament() != null ? race.getTournament().getId() : null)
                .tournamentName(race.getTournament() != null ? race.getTournament().getName() : null)
                .name(race.getName())
                .raceTime(race.getRaceTime())
                .status(race.getStatus())
                .refereeId(race.getReferee() != null ? race.getReferee().getId() : null)
                .refereeUsername(race.getReferee() != null ? race.getReferee().getUsername() : null)
                .prize1(race.getPrize1())
                .prize2(race.getPrize2())
                .prize3(race.getPrize3())
                .build();
    }

    @Override
    public List<LiveOddsResponseDTO> getLiveOdds(Integer raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chặng đua!"));

        java.math.BigDecimal totalPool = race.getTotalPool();
        java.math.BigDecimal rakePercentage = race.getRakePercentage();

        java.math.BigDecimal netPool = totalPool.multiply(
                java.math.BigDecimal.valueOf(100).subtract(rakePercentage)
        ).divide(java.math.BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP);

        List<Registration> registrations = registrationRepository.findByRaceId(raceId);
        List<LiveOddsResponseDTO> oddsList = new java.util.ArrayList<>();

        for (Registration reg : registrations) {
            java.math.BigDecimal totalBetOnHorse = betRepository.sumAmountByRaceIdAndRegistrationId(raceId, reg.getId());
            java.math.BigDecimal calculatedOdds = java.math.BigDecimal.ZERO;

            if (totalBetOnHorse.compareTo(java.math.BigDecimal.ZERO) > 0) {
                calculatedOdds = netPool.divide(totalBetOnHorse, 2, java.math.RoundingMode.HALF_UP);
            }

            oddsList.add(LiveOddsResponseDTO.builder()
                    .registrationId(reg.getId())
                    .horseName(reg.getHorse().getName())
                    .totalBetOnHorse(totalBetOnHorse)
                    .calculatedOdds(calculatedOdds)
                    .build());
        }

        return oddsList;
    }
}