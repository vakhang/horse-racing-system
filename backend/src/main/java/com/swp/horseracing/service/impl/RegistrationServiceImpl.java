package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.RegistrationRequestDTO;
import com.swp.horseracing.dto.RegistrationResponseDTO;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.*;
import com.swp.horseracing.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final RaceRepository raceRepository;
    private final HorseRepository horseRepository;
    private final UserRepository userRepository;

    // Bổ sung các repo này để hoàn tiền cược khi Ngựa Rút lui
    private final BetRepository betRepository;
    private final WalletRepository walletRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public RegistrationResponseDTO createRegistration(RegistrationRequestDTO request) {
        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Chặng đua ID: " + request.getRaceId()));
        Horse horse = horseRepository.findById(request.getHorseId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Ngựa ID: " + request.getHorseId()));
        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Chủ ngựa ID: " + request.getOwnerId()));

        User jockey = null;
        if (request.getJockeyId() != null) {
            jockey = userRepository.findById(request.getJockeyId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Nài ngựa ID: " + request.getJockeyId()));
        }

        // BỨC TƯỜNG LỬA CHẶN NGỰA BỆNH HOẶC CHƯA ĐƯỢC DUYỆT (TC_OWN_004)
        if (horse.getStatus() != HorseStatus.APPROVED) {
            throw new RuntimeException("Ngựa chưa được duyệt hoặc đã bị từ chối! Không thể đăng ký đua.");
        }
        if ("INJURED".equalsIgnoreCase(horse.getHealthStatus()) || "SICK".equalsIgnoreCase(horse.getHealthStatus())) {
            throw new RuntimeException("Ngựa đang gặp vấn đề về sức khỏe (INJURED/SICK)! Không thể đăng ký đua.");
        }

        // CHỐNG TRÙNG LẶP ĐĂNG KÝ (FR-10)
        if (registrationRepository.existsByRaceIdAndHorseId(race.getId(), horse.getId())) {
            throw new RuntimeException("Ngựa này đã được đăng ký trong chặng đua này rồi!");
        }

        Registration registration = Registration.builder()
                .race(race)
                .horse(horse)
                .owner(owner)
                .jockey(jockey)
                .status(request.getStatus() != null ? request.getStatus() : RegistrationStatus.WAITING_JOCKEY)
                .note(request.getNote())
                .build();

        return mapToResponseDTO(registrationRepository.save(registration));
    }

    @Override
    public List<RegistrationResponseDTO> getAllRegistrations() {
        return registrationRepository.findAll().stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<RegistrationResponseDTO> getRegistrationsByRaceId(Integer raceId) {
        return registrationRepository.findByRaceId(raceId).stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<RegistrationResponseDTO> getRegistrationsByOwnerId(Integer ownerId) {
        return registrationRepository.findByOwnerId(ownerId).stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<RegistrationResponseDTO> getRegistrationsByJockeyId(Integer jockeyId) {
        return registrationRepository.findByJockeyId(jockeyId).stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public RegistrationResponseDTO getRegistrationById(Integer id) {
        Registration reg = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Đơn đăng ký ID: " + id));
        return mapToResponseDTO(reg);
    }

    @Override
    @Transactional
    public RegistrationResponseDTO updateRegistration(Integer id, RegistrationRequestDTO request) {
        Registration reg = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Đơn đăng ký ID: " + id));

        if (request.getJockeyId() != null) {
            User jockey = userRepository.findById(request.getJockeyId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Nài ngựa ID: " + request.getJockeyId()));
            reg.setJockey(jockey);
        }

        if (request.getStatus() != null && request.getStatus() != reg.getStatus()) {
            if (request.getStatus() == RegistrationStatus.WITHDRAWN) {
                withdrawHorseLogic(reg, request.getReason());
            }
            reg.setStatus(request.getStatus());
        }

        if (request.getNote() != null) reg.setNote(request.getNote());

        return mapToResponseDTO(registrationRepository.save(reg));
    }

    // NGHIỆP VỤ RÚT LUI NGỰA & REFUND CỤC BỘ
    private void withdrawHorseLogic(Registration reg, String reason) {
        List<Bet> bets = betRepository.findByRaceId(reg.getRace().getId());
        int affectedCount = 0;
        BigDecimal totalRefund = BigDecimal.ZERO;
        Race race = reg.getRace();

        for (Bet bet : bets) {
            // Chỉ dò tìm những vé cược đặt vào DUY NHẤT con ngựa bị rút lui này
            if (bet.getRegistration().getId().equals(reg.getId()) && bet.getStatus() == BetStatus.PENDING) {
                bet.setStatus(BetStatus.REFUNDED);
                betRepository.save(bet);
                
                // TRỪ POOL: Khấu trừ tiền cược (Gross Sales -> Net Sales)
                BigDecimal currentPool = race.getTotalPool() != null ? race.getTotalPool() : BigDecimal.ZERO;
                race.setTotalPool(currentPool.subtract(bet.getAmount()));

                Wallet wallet = walletRepository.findByUserId(bet.getSpectator().getId()).orElse(null);
                if (wallet != null) {
                    wallet.setBalance(wallet.getBalance().add(bet.getAmount()));
                    walletRepository.save(wallet);

                    TransactionHistory tx = TransactionHistory.builder()
                            .transactionCode("REFUND-WD-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                            .wallet(wallet)
                            .amount(bet.getAmount())
                            .type(TransactionType.REFUND)
                            .direction(TransactionDirection.IN)
                            .status(TransactionStatus.COMPLETED)
                            .build();
                    transactionHistoryRepository.save(tx);

                    totalRefund = totalRefund.add(bet.getAmount());
                    affectedCount++;
                }
            }
        }
        // Cập nhật lại Quỹ Tổng (Total Pool)
        raceRepository.save(race);

        // Ghi Sổ Nhật Ký (Audit Log)
        AuditLog log = AuditLog.builder()
                .action("WITHDRAW_HORSE")
                .performedBy("ADMIN_SYSTEM")
                .reason(reason != null ? reason : "Ngựa rút lui khỏi chặng đua do sự cố")
                .affectedBetsCount(affectedCount)
                .totalRefundAmount(totalRefund)
                .build();
        auditLogRepository.save(log);
    }

    @Override
    @Transactional
    public void deleteRegistration(Integer id) {
        if (!registrationRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy Đơn đăng ký ID: " + id);
        }
        registrationRepository.deleteById(id);
    }

    private RegistrationResponseDTO mapToResponseDTO(Registration reg) {
        return RegistrationResponseDTO.builder()
                .id(reg.getId())
                .raceId(reg.getRace() != null ? reg.getRace().getId() : null)
                .raceName(reg.getRace() != null ? reg.getRace().getName() : null)
                .horseId(reg.getHorse() != null ? reg.getHorse().getId() : null)
                .horseName(reg.getHorse() != null ? reg.getHorse().getName() : null)
                .ownerId(reg.getOwner() != null ? reg.getOwner().getId() : null)
                .ownerUsername(reg.getOwner() != null ? reg.getOwner().getUsername() : null)
                .jockeyId(reg.getJockey() != null ? reg.getJockey().getId() : null)
                .jockeyUsername(reg.getJockey() != null ? reg.getJockey().getUsername() : null)
                .status(reg.getStatus())
                .note(reg.getNote())
                .build();
    }
}