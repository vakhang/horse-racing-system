package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.BetRequestDTO;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.*;
import com.swp.horseracing.service.BetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BetServiceImpl implements BetService {
    private final BetRepository betRepository;
    private final UserRepository userRepository;
    private final RaceRepository raceRepository;
    private final RegistrationRepository registrationRepository;
    private final WalletRepository walletRepository;
    private final TransactionHistoryRepository transactionRepository;
    private final SystemFundRepository systemFundRepository;

    @Override
    @Transactional
    public Bet createBet(BetRequestDTO request) {
        User spectator = userRepository.findById(request.getSpectatorId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Khán giả!"));

        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chặng đua!"));

        if (race.getStatus() != RaceStatus.BETTING) {
            throw new RuntimeException("Chặng đua hiện không trong trạng thái nhận cược!");
        }

        Registration reg1 = registrationRepository.findById(request.getRegistrationId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngựa 1!"));

        Registration reg2 = null;
        if (request.getRegistrationId2() != null) {
            reg2 = registrationRepository.findById(request.getRegistrationId2())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy ngựa 2!"));
        }

        // TÍNH TỔNG CƯỢC TRONG NGÀY ĐỂ CHECK LIMIT 1 TRIỆU
        java.time.LocalDateTime startOfDay = java.time.LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDate().atStartOfDay();
        java.time.LocalDateTime endOfDay = startOfDay.plusDays(1).minusSeconds(1);

        BigDecimal totalBetToday = betRepository.sumDailyBetAmountBySpectatorId(spectator.getId(), startOfDay, endOfDay);
        if (totalBetToday == null) totalBetToday = BigDecimal.ZERO;

        if (totalBetToday.add(request.getAmount()).compareTo(new BigDecimal("1000000")) > 0) {
            throw new RuntimeException("Bạn đã vượt quá hạn mức cược tối đa 1.000.000 VNĐ/ngày!");
        }

        Wallet wallet = walletRepository.findByUserId(spectator.getId())
                .orElseThrow(() -> new RuntimeException("Tài khoản chưa có ví!"));

        if (wallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Số dư không đủ để đặt cược!");
        }

        // Trừ tiền ví
        wallet.setBalance(wallet.getBalance().subtract(request.getAmount()));
        walletRepository.save(wallet);

        BetType type = request.getBetType() != null ? request.getBetType() : BetType.WIN;

        // Lưu vé cược
        Bet bet = Bet.builder()
                .spectator(spectator)
                .race(race)
                .betType(type)
                .registration(reg1)
                .registration2(reg2)
                .amount(request.getAmount())
                .status(BetStatus.PENDING)
                .expectedOdds(BigDecimal.ONE) // Tỷ lệ tạm thời
                .build();
        Bet savedBet = betRepository.save(bet);

        // Ghi lịch sử trừ tiền
        TransactionHistory history = TransactionHistory.builder()
                .transactionCode("BET-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .wallet(wallet)
                .amount(request.getAmount())
                .type(TransactionType.BET)
                .direction(TransactionDirection.OUT)
                .bet(savedBet)
                .status(TransactionStatus.COMPLETED)
                .build();
        transactionRepository.save(history);

        // Cộng vào tổng pool
        BigDecimal currentPool = race.getTotalPool() != null ? race.getTotalPool() : BigDecimal.ZERO;
        race.setTotalPool(currentPool.add(request.getAmount()));
        raceRepository.save(race);

        return savedBet;
    }

    @Override
    @Transactional
    public void calculateAndPayoutRewards(Race race) {
        List<Bet> allBets = betRepository.findByRaceId(race.getId());

        // Lấy ngựa về Nhất và Nhì
        Registration firstPlace = getRegistrationByRank(race, 1);
        Registration secondPlace = getRegistrationByRank(race, 2);

        // 1. Phân tách Total Pool (65% Payout Pool cho từng thể loại cược)
        BigDecimal winPool = sumBetsByType(allBets, BetType.WIN).multiply(new BigDecimal("0.65"));
        BigDecimal placePool = sumBetsByType(allBets, BetType.PLACE).multiply(new BigDecimal("0.65"));
        BigDecimal quinellaPool = sumBetsByType(allBets, BetType.QUINELLA).multiply(new BigDecimal("0.65"));
        BigDecimal exactaPool = sumBetsByType(allBets, BetType.EXACTA).multiply(new BigDecimal("0.65"));

        // Xử lý cược WIN (Đơn Thắng - 1st)
        processWinBets(allBets, firstPlace, winPool, race);

        // Xử lý cược PLACE (Nhất Nhì - 1st hoặc 2nd, chia đôi 32.5% - 32.5%)
        processPlaceBets(allBets, firstPlace, secondPlace, placePool, race);

        // Xử lý cược QUINELLA (Cặp Đôi Top 2, không quan trọng thứ tự)
        processQuinellaBets(allBets, firstPlace, secondPlace, quinellaPool, race);

        // Xử lý cược EXACTA (Cặp Chính Xác 1st & 2nd + Jackpot Carryover nếu không ai trúng)
        processExactaBets(allBets, firstPlace, secondPlace, exactaPool, race);
    }

    private BigDecimal sumBetsByType(List<Bet> bets, BetType type) {
        return bets.stream()
                .filter(b -> b.getBetType() == type && b.getStatus() != BetStatus.REFUNDED && b.getStatus() != BetStatus.CANCELED)
                .map(Bet::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Registration getRegistrationByRank(Race race, int rank) {
        return registrationRepository.findAll().stream()
                .filter(r -> r.getRace().getId().equals(race.getId()) && r.getRank() != null && r.getRank() == rank)
                .findFirst().orElse(null);
    }

    // 2a. Cược Đơn Thắng (Win)
    private void processWinBets(List<Bet> allBets, Registration firstPlace, BigDecimal winPool, Race race) {
        if (firstPlace == null) return;
        List<Bet> winBets = allBets.stream().filter(b -> b.getBetType() == BetType.WIN).toList();
        if (winBets.isEmpty()) return;

        BigDecimal totalBetWinner = winBets.stream()
                .filter(b -> b.getRegistration().getId().equals(firstPlace.getId()))
                .map(Bet::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalBetWinner.compareTo(BigDecimal.ZERO) == 0) {
            for (Bet b : winBets) refundBet(b);
            return;
        }

        BigDecimal rawOdds = winPool.divide(totalBetWinner, 2, RoundingMode.HALF_UP);
        BigDecimal finalOdds = ensureMinusPoolProtection(rawOdds, totalBetWinner, winPool, race);

        for (Bet b : winBets) {
            if (b.getRegistration().getId().equals(firstPlace.getId())) {
                payoutWinningBet(b, finalOdds);
            } else {
                b.setStatus(BetStatus.LOST);
                betRepository.save(b);
            }
        }
    }

    // 2b. Cược Nhất Nhì (Place): Chia đôi 65% thành 2 nửa 32.5% cho Nhất và 32.5% cho Nhì
    private void processPlaceBets(List<Bet> allBets, Registration firstPlace, Registration secondPlace, BigDecimal placePool, Race race) {
        List<Bet> placeBets = allBets.stream().filter(b -> b.getBetType() == BetType.PLACE).toList();
        if (placeBets.isEmpty()) return;

        BigDecimal pool1st = placePool.multiply(new BigDecimal("0.50")); // 32.5% của tổng cược Place
        BigDecimal pool2nd = placePool.multiply(new BigDecimal("0.50")); // 32.5% của tổng cược Place

        BigDecimal total1st = firstPlace != null ? placeBets.stream()
                .filter(b -> b.getRegistration().getId().equals(firstPlace.getId()))
                .map(Bet::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add) : BigDecimal.ZERO;

        BigDecimal total2nd = secondPlace != null ? placeBets.stream()
                .filter(b -> b.getRegistration().getId().equals(secondPlace.getId()))
                .map(Bet::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add) : BigDecimal.ZERO;

        BigDecimal odds1st = total1st.compareTo(BigDecimal.ZERO) > 0 ? ensureMinusPoolProtection(pool1st.divide(total1st, 2, RoundingMode.HALF_UP), total1st, pool1st, race) : BigDecimal.ZERO;
        BigDecimal odds2nd = total2nd.compareTo(BigDecimal.ZERO) > 0 ? ensureMinusPoolProtection(pool2nd.divide(total2nd, 2, RoundingMode.HALF_UP), total2nd, pool2nd, race) : BigDecimal.ZERO;

        for (Bet b : placeBets) {
            if (firstPlace != null && b.getRegistration().getId().equals(firstPlace.getId())) {
                payoutWinningBet(b, odds1st);
            } else if (secondPlace != null && b.getRegistration().getId().equals(secondPlace.getId())) {
                payoutWinningBet(b, odds2nd);
            } else {
                b.setStatus(BetStatus.LOST);
                betRepository.save(b);
            }
        }
    }

    // 2c. Cược Cặp Đôi (Quinella): 2 con về Top 2, không phân biệt thứ tự
    private void processQuinellaBets(List<Bet> allBets, Registration firstPlace, Registration secondPlace, BigDecimal quinellaPool, Race race) {
        if (firstPlace == null || secondPlace == null) return;
        List<Bet> quinellaBets = allBets.stream().filter(b -> b.getBetType() == BetType.QUINELLA).toList();
        if (quinellaBets.isEmpty()) return;

        BigDecimal totalBetWinnerPair = quinellaBets.stream()
                .filter(b -> (b.getRegistration().getId().equals(firstPlace.getId()) && b.getRegistration2() != null && b.getRegistration2().getId().equals(secondPlace.getId())) ||
                             (b.getRegistration().getId().equals(secondPlace.getId()) && b.getRegistration2() != null && b.getRegistration2().getId().equals(firstPlace.getId())))
                .map(Bet::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalBetWinnerPair.compareTo(BigDecimal.ZERO) == 0) {
            for (Bet b : quinellaBets) refundBet(b);
            return;
        }

        BigDecimal rawOdds = quinellaPool.divide(totalBetWinnerPair, 2, RoundingMode.HALF_UP);
        BigDecimal finalOdds = ensureMinusPoolProtection(rawOdds, totalBetWinnerPair, quinellaPool, race);

        for (Bet b : quinellaBets) {
            boolean isWinner = (b.getRegistration().getId().equals(firstPlace.getId()) && b.getRegistration2() != null && b.getRegistration2().getId().equals(secondPlace.getId())) ||
                               (b.getRegistration().getId().equals(secondPlace.getId()) && b.getRegistration2() != null && b.getRegistration2().getId().equals(firstPlace.getId()));
            if (isWinner) {
                payoutWinningBet(b, finalOdds);
            } else {
                b.setStatus(BetStatus.LOST);
                betRepository.save(b);
            }
        }
    }

    // 2d. Cược Cặp Đôi Chính Xác (Exacta): Đoán chính xác tuyệt đối Con 1 Nhất & Con 2 Nhì + Jackpot Carryover
    private void processExactaBets(List<Bet> allBets, Registration firstPlace, Registration secondPlace, BigDecimal exactaPool, Race race) {
        if (firstPlace == null || secondPlace == null) return;
        List<Bet> exactaBets = allBets.stream().filter(b -> b.getBetType() == BetType.EXACTA).toList();
        if (exactaBets.isEmpty()) return;

        BigDecimal totalBetExacta = exactaBets.stream()
                .filter(b -> b.getRegistration().getId().equals(firstPlace.getId()) && b.getRegistration2() != null && b.getRegistration2().getId().equals(secondPlace.getId()))
                .map(Bet::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalBetExacta.compareTo(BigDecimal.ZERO) == 0) {
            // Không ai trúng EXACTA -> Lưu Jackpot Carryover cho chặng đua cùng Class
            Integer requiredClass = (race.getTournament() != null && race.getTournament().getRequiredClass() != null) ? race.getTournament().getRequiredClass() : 4;
            SystemFund jackpot = systemFundRepository.findByFundTypeAndClassLevelWithPessimisticWrite("JACKPOT", requiredClass)
                    .orElse(null);
            if (jackpot != null) {
                jackpot.setBalance(jackpot.getBalance().add(exactaPool));
                systemFundRepository.save(jackpot);
            }
            for (Bet b : exactaBets) {
                b.setStatus(BetStatus.LOST);
                betRepository.save(b);
            }
            return;
        }

        BigDecimal rawOdds = exactaPool.divide(totalBetExacta, 2, RoundingMode.HALF_UP);
        BigDecimal finalOdds = ensureMinusPoolProtection(rawOdds, totalBetExacta, exactaPool, race);

        for (Bet b : exactaBets) {
            if (b.getRegistration().getId().equals(firstPlace.getId()) && b.getRegistration2() != null && b.getRegistration2().getId().equals(secondPlace.getId())) {
                payoutWinningBet(b, finalOdds);
            } else {
                b.setStatus(BetStatus.LOST);
                betRepository.save(b);
            }
        }
    }

    private BigDecimal ensureMinusPoolProtection(BigDecimal odds, BigDecimal totalBetWinner, BigDecimal payoutPool, Race race) {
        BigDecimal minOdds = new BigDecimal("1.05");
        if (odds.compareTo(minOdds) < 0) {
            BigDecimal deficit = totalBetWinner.multiply(minOdds).subtract(payoutPool);
            SystemFund riskReserve = systemFundRepository.findByFundTypeWithPessimisticWrite("RISK_RESERVE").orElse(null);
            if (riskReserve != null && riskReserve.getBalance().compareTo(deficit) >= 0) {
                riskReserve.setBalance(riskReserve.getBalance().subtract(deficit));
                systemFundRepository.save(riskReserve);
            }
            if (race.getMinusPoolDeficit() == null) race.setMinusPoolDeficit(BigDecimal.ZERO);
            race.setMinusPoolDeficit(race.getMinusPoolDeficit().add(deficit));
            raceRepository.save(race);

            return minOdds;
        }
        return odds;
    }

    private void payoutWinningBet(Bet bet, BigDecimal odds) {
        BigDecimal grossPayout = bet.getAmount().multiply(odds).setScale(2, RoundingMode.HALF_UP);
        BigDecimal profit = grossPayout.subtract(bet.getAmount());
        BigDecimal pit = BigDecimal.ZERO;
        BigDecimal threshold = new BigDecimal("10000000");

        if (profit.compareTo(threshold) > 0) {
            pit = profit.subtract(threshold).multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal netPayout = grossPayout.subtract(pit);

        bet.setExpectedOdds(odds);
        bet.setGrossPayout(grossPayout);
        bet.setNetPayout(netPayout);
        bet.setReward(netPayout);
        bet.setStatus(BetStatus.WON);
        betRepository.save(bet);

        // Cộng tiền vào ví khán giả
        Wallet wallet = walletRepository.findByUserId(bet.getSpectator().getId())
                .orElseThrow(() -> new RuntimeException("Tài khoản chưa có ví!"));
        wallet.setBalance(wallet.getBalance().add(netPayout));
        walletRepository.save(wallet);

        // Ghi log tiền thắng
        TransactionHistory history = TransactionHistory.builder()
                .transactionCode("RW-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .wallet(wallet)
                .amount(grossPayout)
                .type(TransactionType.REWARD)
                .direction(TransactionDirection.IN)
                .bet(bet)
                .status(TransactionStatus.COMPLETED)
                .build();
        transactionRepository.save(history);

        // Ghi log khấu trừ thuế PIT
        if (pit.compareTo(BigDecimal.ZERO) > 0) {
            TransactionHistory txTax = TransactionHistory.builder()
                    .transactionCode("TAX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .wallet(wallet)
                    .amount(pit)
                    .type(TransactionType.TAX)
                    .direction(TransactionDirection.OUT)
                    .bet(bet)
                    .status(TransactionStatus.COMPLETED)
                    .taxAmount(pit)
                    .build();
            transactionRepository.save(txTax);
        }
    }

    private void refundBet(Bet bet) {
        bet.setStatus(BetStatus.REFUNDED);
        bet.setReward(bet.getAmount());
        betRepository.save(bet);

        Wallet wallet = walletRepository.findByUserId(bet.getSpectator().getId())
                .orElseThrow(() -> new RuntimeException("Tài khoản chưa có ví!"));
        wallet.setBalance(wallet.getBalance().add(bet.getAmount()));
        walletRepository.save(wallet);
    }
}