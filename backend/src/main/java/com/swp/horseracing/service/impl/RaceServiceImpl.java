package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.LiveOddsResponseDTO;
import com.swp.horseracing.dto.RaceRequestDTO;
import com.swp.horseracing.dto.RaceResponseDTO;
import com.swp.horseracing.model.Race;
import com.swp.horseracing.model.RaceStatus;
import com.swp.horseracing.model.Registration;
import com.swp.horseracing.model.Tournament;
import com.swp.horseracing.repository.BetRepository;
import com.swp.horseracing.repository.RaceRepository;
import com.swp.horseracing.repository.RegistrationRepository;
import com.swp.horseracing.repository.TournamentRepository;
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
    private final TournamentRepository tournamentRepository; // Tiêm vào để check khóa ngoại

    private final RegistrationRepository registrationRepository;
    private final BetRepository betRepository;

    @Override
    @Transactional
    public RaceResponseDTO createRace(RaceRequestDTO request) {
        // 1. Kiểm tra xem Giải đấu có tồn tại không
        Tournament tournament = tournamentRepository.findById(request.getTournamentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Giải đấu với ID: " + request.getTournamentId()));

        // 2. Tạo Chặng đua và gán Giải đấu vào
        Race race = Race.builder()
                .tournament(tournament)
                .name(request.getName())
                .raceTime(request.getRaceTime())
                .status(request.getStatus() != null ? request.getStatus() : RaceStatus.PENDING)
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

        // Nếu có update cả giải đấu chứa chặng đua này
        if (request.getTournamentId() != null && !race.getTournament().getId().equals(request.getTournamentId())) {
            Tournament newTournament = tournamentRepository.findById(request.getTournamentId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Giải đấu mới với ID: " + request.getTournamentId()));
            race.setTournament(newTournament);
        }

        if (request.getName() != null) race.setName(request.getName());
        if (request.getRaceTime() != null) race.setRaceTime(request.getRaceTime());
        if (request.getStatus() != null) race.setStatus(request.getStatus());

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
                .build();
    }

    @Override
    public List<LiveOddsResponseDTO> getLiveOdds(Integer raceId) {
        // 1. Tìm thông tin chặng đua
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chặng đua!"));

        // 2. Lấy tổng tiền quỹ (total_pool) và phần trăm phí nhà cái (rake_percentage) từ Race
        java.math.BigDecimal totalPool = race.getTotalPool();
        java.math.BigDecimal rakePercentage = race.getRakePercentage();

        // 3. Tính số tiền thực tế còn lại trong quỹ sau khi trừ phế nhà cái (Net Pool)
        // Công thức: NetPool = TotalPool * (100 - rakePercentage) / 100
        java.math.BigDecimal netPool = totalPool.multiply(
                java.math.BigDecimal.valueOf(100).subtract(rakePercentage)
        ).divide(java.math.BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP);

        // 4. Lấy danh sách toàn bộ ngựa (Registration) đã được duyệt tham gia chặng này
        List<Registration> registrations = registrationRepository.findByRaceId(raceId);

        List<LiveOddsResponseDTO> oddsList = new java.util.ArrayList<>();

        // 5. Duyệt qua từng con ngựa để tính tỷ lệ cược real-time
        for (Registration reg : registrations) {
            // Query tổng số tiền cược vào con ngựa (registration) này trong chặng đua đó
            java.math.BigDecimal totalBetOnHorse = betRepository.sumAmountByRaceIdAndRegistrationId(raceId, reg.getId());

            java.math.BigDecimal calculatedOdds = java.math.BigDecimal.ZERO;

            // Công thức: Odds = NetPool / TotalBetOnHorse
            if (totalBetOnHorse.compareTo(java.math.BigDecimal.ZERO) > 0) {
                calculatedOdds = netPool.divide(totalBetOnHorse, 2, java.math.RoundingMode.HALF_UP);
            }

            // Đóng gói dữ liệu đưa vào danh sách trả về
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