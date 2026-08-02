package com.swp.horseracing.service;

import com.swp.horseracing.dto.TournamentRequestDTO;
import com.swp.horseracing.dto.TournamentResponseDTO;
import java.util.List;

    // [Chức năng rõ ràng]: Interface Service Giải đấu
    // [Tác dụng]: Định nghĩa hàm CRUD giải đấu, và hàm Hủy giải hoàn tiền.
    // [Hướng dẫn sửa đổi]:
    // - Logic: Khai báo thêm hàm sao chép giải đấu cũ.
public interface TournamentService {
    TournamentResponseDTO createTournament(TournamentRequestDTO request);
    List<TournamentResponseDTO> getAllTournaments();
    TournamentResponseDTO getTournamentById(Integer id);
    TournamentResponseDTO updateTournament(Integer id, TournamentRequestDTO request);
    void deleteTournament(Integer id);

    // THÊM DÒNG NÀY:
    void cancelTournament(Integer id);
}