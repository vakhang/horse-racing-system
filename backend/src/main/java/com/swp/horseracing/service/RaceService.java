package com.swp.horseracing.service;

import com.swp.horseracing.dto.RaceRequestDTO;
import com.swp.horseracing.dto.RaceResponseDTO;

import java.util.List;

    // [Chức năng rõ ràng]: Interface Service Chặng đua
    // [Tác dụng]: Định nghĩa hàm tạo, sửa, xóa, và kích hoạt trả thưởng chặng đua.
    // [Hướng dẫn sửa đổi]:
    // - Logic: Thêm hàm cập nhật thời tiết cho chặng đua.
public interface RaceService {
    RaceResponseDTO createRace(RaceRequestDTO request);
    List<RaceResponseDTO> getAllRaces();
    List<RaceResponseDTO> getRacesByTournamentId(Integer tournamentId);
    RaceResponseDTO getRaceById(Integer id);
    void cancelRace(Integer id);
    RaceResponseDTO forceTransition(Integer id, String targetStatus);
    RaceResponseDTO updateRace(Integer id, RaceRequestDTO request);
    void deleteRace(Integer id);
    void cleanupInvalidRegistrations(Integer raceId);

    java.util.List<com.swp.horseracing.dto.LiveOddsResponseDTO> getLiveOdds(Integer raceId);
    void payoutRace(Integer id);

}