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
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TournamentServiceImpl implements TournamentService {

    private final TournamentRepository tournamentRepository;
    private final RaceRepository raceRepository;
    private final BetRepository betRepository;
    private final WalletRepository walletRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final AuditLogRepository auditLogRepository; // Inject AuditLog

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

        // BỨC TƯỜNG LỬA CHẶN ADMIN SET STATUS BẰNG TAY (Chỉ cho phép chọn CANCELED hoặc POSTPONED)
        if (request.getStatus() != null && request.getStatus() != tournament.getStatus()) {
            TournamentStatus newStatus = request.getStatus();

            if (newStatus == TournamentStatus.UPCOMING || newStatus == TournamentStatus.ONGOING || newStatus == TournamentStatus.COMPLETED) {
                throw new RuntimeException("Nghiêm cấm can thiệp! Admin không được phép tự chuyển trạng thái sang: " + newStatus.name() + ". Hệ thống máy đếm ngược sẽ tự động đồng bộ thời gian chuẩn.");
            }

            if (newStatus == TournamentStatus.CANCELED) {
                cancelTournamentLogic(tournament, request.getReason());
            } else if (newStatus == TournamentStatus.POSTPONED) {
                postponeTournamentLogic(tournament, request.getStartDate(), request.getEndDate(), request.getReason());
            }
        } else {
            // Nếu không có can thiệp ngoại lệ, cập nhật thời gian bình thường
            if (request.getStartDate() != null) tournament.setStartDate(request.getStartDate());
            if (request.getEndDate() != null) tournament.setEndDate(request.getEndDate());
        }

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

    @Override
    @Transactional
    public void cancelTournament(Integer id) {
        Tournament tournament = tournamentRepository.findById(id).orElseThrow();
        cancelTournamentLogic(tournament, "Hủy giải đấu thông qua API trực tiếp");
    }

    // NGHIỆP VỤ HỦY BỎ VÀ HOÀN TIỀN
    private void cancelTournamentLogic(Tournament tournament, String reason) {
        tournament.setStatus(TournamentStatus.CANCELED);
        List<Race> races = raceRepository.findByTournamentId(tournament.getId());

        int totalAffected = 0;
        BigDecimal totalRefund = BigDecimal.ZERO;

        for (Race race : races) {
            race.setStatus(RaceStatus.CANCELED);
            raceRepository.save(race);

            List<Bet> bets = betRepository.findByRaceId(race.getId());
            for (Bet bet : bets) {
                if (bet.getStatus() == BetStatus.PENDING) {
                    bet.setStatus(BetStatus.CANCELED);
                    betRepository.save(bet);

                    Wallet wallet = walletRepository.findByUserId(bet.getSpectator().getId()).orElse(null);
                    if (wallet != null) {
                        wallet.setBalance(wallet.getBalance().add(bet.getAmount()));
                        walletRepository.save(wallet);

                        TransactionHistory tx = TransactionHistory.builder()
                                .transactionCode("REFUND-CANCEL-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                                .wallet(wallet)
                                .amount(bet.getAmount())
                                .type(TransactionType.REFUND)
                                .direction(TransactionDirection.IN)
                                .status(TransactionStatus.COMPLETED)
                                .build();
                        transactionHistoryRepository.save(tx);
                        totalRefund = totalRefund.add(bet.getAmount());
                        totalAffected++;
                    }
                }
            }
        }
        tournamentRepository.save(tournament);

        // Ghi Sổ Nhật Ký (Audit Log)
        AuditLog log = AuditLog.builder()
                .action("CANCEL_TOURNAMENT")
                .performedBy("ADMIN_SYSTEM")
                .reason(reason != null ? reason : "Hủy sự kiện do nguyên nhân bất khả kháng")
                .affectedBetsCount(totalAffected)
                .totalRefundAmount(totalRefund)
                .build();
        auditLogRepository.save(log);
    }

    // NGHIỆP VỤ HOÃN (TỊNH TIẾN GIỜ & CHECK LUẬT 36 TIẾNG)
    private void postponeTournamentLogic(Tournament tournament, LocalDateTime newStart, LocalDateTime newEnd, String reason) {
        LocalDateTime oldStartDate = tournament.getStartDate();
        tournament.setStatus(TournamentStatus.POSTPONED);
        tournament.setStartDate(newStart);
        tournament.setEndDate(newEnd);
        tournamentRepository.save(tournament);

        long hoursDelay = java.time.Duration.between(oldStartDate, newStart).toHours();

        int totalAffected = 0;
        BigDecimal totalRefund = BigDecimal.ZERO;

        List<Race> races = raceRepository.findByTournamentId(tournament.getId());
        for (Race race : races) {
            if (race.getStatus() == RaceStatus.PENDING) {
                // Tịnh tiến đồng bộ giờ xuất phát của tất cả các chặng đua bên trong
                race.setRaceTime(race.getRaceTime().plusHours(hoursDelay));
                raceRepository.save(race);

                // Luật pháp quy định: Trễ quá 36 tiếng bắt buộc kích hoạt Refund
                if (hoursDelay > 36) {
                    List<Bet> bets = betRepository.findByRaceId(race.getId());
                    for (Bet bet : bets) {
                        if (bet.getStatus() == BetStatus.PENDING) {
                            bet.setStatus(BetStatus.CANCELED);
                            betRepository.save(bet);

                            Wallet wallet = walletRepository.findByUserId(bet.getSpectator().getId()).orElse(null);
                            if (wallet != null) {
                                wallet.setBalance(wallet.getBalance().add(bet.getAmount()));
                                walletRepository.save(wallet);

                                TransactionHistory tx = TransactionHistory.builder()
                                        .transactionCode("REFUND-DELAY-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                                        .wallet(wallet)
                                        .amount(bet.getAmount())
                                        .type(TransactionType.REFUND)
                                        .direction(TransactionDirection.IN)
                                        .status(TransactionStatus.COMPLETED)
                                        .build();
                                transactionHistoryRepository.save(tx);
                                totalRefund = totalRefund.add(bet.getAmount());
                                totalAffected++;
                            }
                        }
                    }
                }
            }
        }

        // Ghi Sổ Nhật Ký (Audit Log)
        AuditLog log = AuditLog.builder()
                .action("POSTPONE_TOURNAMENT")
                .performedBy("ADMIN_SYSTEM")
                .reason((reason != null ? reason : "Hoãn sự kiện") + " | Hoãn " + hoursDelay + " tiếng")
                .affectedBetsCount(totalAffected)
                .totalRefundAmount(totalRefund)
                .build();
        auditLogRepository.save(log);
    }

    private TournamentResponseDTO mapToResponseDTO(Tournament tournament) {
        return TournamentResponseDTO.builder()
                .id(tournament.getId())
                .name(tournament.getName())
                .startDate(tournament.getStartDate())
                .endDate(tournament.getEndDate())
                .status(tournament.getStatus() != null ? tournament.getStatus() : com.swp.horseracing.model.TournamentStatus.UPCOMING)
                .build();
    }
}