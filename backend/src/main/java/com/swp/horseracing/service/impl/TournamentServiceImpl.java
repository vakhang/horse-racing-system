package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.TournamentRequestDTO;
import com.swp.horseracing.dto.TournamentResponseDTO;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.*;
import com.swp.horseracing.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TournamentServiceImpl implements TournamentService {

    private final TournamentRepository tournamentRepository;

    // Phải tiêm thêm mấy kho này để xử lý hoàn tiền
    private final RaceRepository raceRepository;
    private final BetRepository betRepository;
    private final WalletRepository walletRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;

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

    // THUẬT TOÁN HỦY GIẢI ĐẤU & TỰ ĐỘNG HOÀN TIỀN
    @Override
    @Transactional
    public void cancelTournament(Integer id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Giải đấu!"));

        // Đánh dấu giải đấu kết thúc
        tournament.setStatus(TournamentStatus.COMPLETED);

        // 1. Tìm tất cả các chặng đua của giải
        List<Race> races = raceRepository.findByTournamentId(id);
        for (Race race : races) {
            // Hủy chặng đua
            race.setStatus(RaceStatus.CANCELED);
            raceRepository.save(race);

            // 2. Hoàn tiền cược cho tất cả vé cược đang PENDING
            List<Bet> bets = betRepository.findByRaceId(race.getId());
            for (Bet bet : bets) {
                if (bet.getStatus() == BetStatus.PENDING) {
                    bet.setStatus(BetStatus.CANCELED);
                    betRepository.save(bet);

                    // Cộng lại tiền vào ví người chơi
                    Wallet wallet = walletRepository.findByUserId(bet.getSpectator().getId())
                            .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy ví người chơi"));
                    wallet.setBalance(wallet.getBalance().add(bet.getAmount()));
                    walletRepository.save(wallet);

                    // Ghi lại lịch sử hoàn tiền (REFUND)
                    TransactionHistory tx = TransactionHistory.builder()
                            .transactionCode("REFUND-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                            .wallet(wallet)
                            .amount(bet.getAmount())
                            .type(TransactionType.REFUND)
                            .direction(TransactionDirection.IN)
                            .status(TransactionStatus.COMPLETED)
                            .build();
                    transactionHistoryRepository.save(tx);
                }
            }
        }
        tournamentRepository.save(tournament);
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