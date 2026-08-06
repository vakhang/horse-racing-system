package com.swp.horseracing.config;

import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SampleDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserAttachmentRepository userAttachmentRepository;
    private final WalletRepository walletRepository;
    private final HorseRepository horseRepository;
    private final TournamentRepository tournamentRepository;
    private final RaceRepository raceRepository;
    private final RegistrationRepository registrationRepository;
    private final JockeyInvitationRepository jockeyInvitationRepository;
    private final BetRepository betRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final SystemContentRepository systemContentRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Checking database state for seeding realistic sample data...");

        // If sample spectator 'khang' exists and tournaments exist, skip re-seeding
        if (userRepository.findByUsername("khang").isPresent() && tournamentRepository.count() >= 3) {
            log.info("Sample database is already seeded. Skipping initial seeding.");
            return;
        }

        log.info("Seeding realistic production sample data (Users, Horses, Tournaments, Races, Bets)...");

        // 1. CREATE USERS
        User admin = createUserIfNotExist("admin", "admin123", "admin@horseracing.com", "0900000001", RoleEnum.ADMIN, LocalDate.of(1985, 5, 20), null, null);
        User ownerDinh = createUserIfNotExist("owner_dinh", "123456", "owner_dinh@horseracing.com", "0900000002", RoleEnum.OWNER, LocalDate.of(1988, 3, 15), null, null);
        User ownerMinh = createUserIfNotExist("owner_minh", "123456", "owner_minh@horseracing.com", "0900000003", RoleEnum.OWNER, LocalDate.of(1990, 8, 10), null, null);
        
        User jockeyHung = createUserIfNotExist("jockey_hung", "123456", "jockey_hung@horseracing.com", "0900000004", RoleEnum.JOCKEY, LocalDate.of(1996, 4, 12), 52.0, 165.0);
        User jockeyTuan = createUserIfNotExist("jockey_tuan", "123456", "jockey_tuan@horseracing.com", "0900000005", RoleEnum.JOCKEY, LocalDate.of(1997, 9, 25), 54.0, 168.0);
        User jockeyBao = createUserIfNotExist("jockey_bao", "123456", "jockey_bao@horseracing.com", "0900000011", RoleEnum.JOCKEY, LocalDate.of(1995, 1, 10), 51.0, 163.0);
        
        User referee1 = createUserIfNotExist("referee1", "123456", "referee1@horseracing.com", "0900000006", RoleEnum.REFEREE, LocalDate.of(1982, 11, 5), null, null);
        User referee2 = createUserIfNotExist("referee2", "123456", "referee2@horseracing.com", "0900000007", RoleEnum.REFEREE, LocalDate.of(1984, 12, 1), null, null);
        
        User spectatorKhang = createUserIfNotExist("khang", "123456", "khang@horseracing.com", "0900000008", RoleEnum.SPECTATOR, LocalDate.of(1995, 2, 14), null, null);
        User spectatorNam = createUserIfNotExist("nam", "123456", "nam@horseracing.com", "0900000009", RoleEnum.SPECTATOR, LocalDate.of(1998, 6, 18), null, null);
        User spectatorLan = createUserIfNotExist("lan", "123456", "lan@horseracing.com", "0900000010", RoleEnum.SPECTATOR, LocalDate.of(1999, 10, 30), null, null);

        // Add attachments for Jockeys and Referees so they pass system filters
        createAttachmentIfMissing(jockeyHung, UserDocType.ID_CARD, "https://images.unsplash.com/photo-1544005313-94ddf0286df2");
        createAttachmentIfMissing(jockeyHung, UserDocType.JOCKEY_CERT, "https://images.unsplash.com/photo-1544005313-94ddf0286df2");
        createAttachmentIfMissing(jockeyHung, UserDocType.HEALTH_CHECK, "https://images.unsplash.com/photo-1544005313-94ddf0286df2");

        createAttachmentIfMissing(jockeyTuan, UserDocType.ID_CARD, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d");
        createAttachmentIfMissing(jockeyTuan, UserDocType.JOCKEY_CERT, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d");
        createAttachmentIfMissing(jockeyTuan, UserDocType.HEALTH_CHECK, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d");

        createAttachmentIfMissing(jockeyBao, UserDocType.ID_CARD, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e");
        createAttachmentIfMissing(jockeyBao, UserDocType.JOCKEY_CERT, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e");
        createAttachmentIfMissing(jockeyBao, UserDocType.HEALTH_CHECK, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e");

        createAttachmentIfMissing(referee1, UserDocType.REFEREE_CERT, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e");
        createAttachmentIfMissing(referee2, UserDocType.REFEREE_CERT, "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e");

        // 2. CREATE WALLETS
        createWalletIfNotExist(admin, new BigDecimal("1000000.00"));
        createWalletIfNotExist(ownerDinh, new BigDecimal("100000000.00"));
        createWalletIfNotExist(ownerMinh, new BigDecimal("80000000.00"));
        createWalletIfNotExist(jockeyHung, new BigDecimal("25000000.00"));
        createWalletIfNotExist(jockeyTuan, new BigDecimal("20000000.00"));
        createWalletIfNotExist(jockeyBao, new BigDecimal("15000000.00"));
        createWalletIfNotExist(referee1, new BigDecimal("10000000.00"));
        createWalletIfNotExist(referee2, new BigDecimal("10000000.00"));
        createWalletIfNotExist(spectatorKhang, new BigDecimal("500100000.00"));
        createWalletIfNotExist(spectatorNam, new BigDecimal("200000000.00"));
        createWalletIfNotExist(spectatorLan, new BigDecimal("150000000.00"));

        // 3. CREATE HORSES
        Horse horse1 = createHorseIfNotExist("Xích Thố Vương", ownerDinh, 5, "Thoroughbred", "Đỏ Nâu", 98, 1, 18, 14);
        Horse horse2 = createHorseIfNotExist("Hắc Phong Chiến", ownerDinh, 4, "Arabian", "Đen Tuyền", 88, 2, 12, 8);
        Horse horse3 = createHorseIfNotExist("Bạch Long Mã", ownerMinh, 4, "Quarter Horse", "Trắng Tuyết", 76, 3, 10, 6);
        Horse horse4 = createHorseIfNotExist("Kim Giáp Thần", ownerMinh, 3, "Thoroughbred", "Vàng Kim", 58, 4, 7, 4);
        Horse horse5 = createHorseIfNotExist("Thượng Điền Mã", ownerMinh, 3, "Quarter Horse", "Nâu Đất", 42, 5, 5, 2);
        Horse horse6 = createHorseIfNotExist("Phi Hồng Sương", ownerDinh, 4, "Thoroughbred", "Hồng Mã", 84, 2, 9, 5);

        // 4. CREATE TOURNAMENTS
        Tournament tour1 = createTournamentIfNotExist("Giải Đua Ngựa Mùa Xuân 2026", LocalDateTime.of(2026, 1, 15, 8, 0), LocalDateTime.of(2026, 1, 20, 18, 0), TournamentStatus.COMPLETED, 2);
        Tournament tour2 = createTournamentIfNotExist("Giải Vô Địch Siêu Cúp Bet989 2026", LocalDateTime.of(2026, 8, 1, 8, 0), LocalDateTime.of(2026, 8, 31, 18, 0), TournamentStatus.ONGOING, 2);
        Tournament tour3 = createTournamentIfNotExist("Giải Đua Ngựa Mùa Thu 2026", LocalDateTime.of(2026, 9, 10, 8, 0), LocalDateTime.of(2026, 9, 20, 18, 0), TournamentStatus.UPCOMING, 3);

        // 5. CREATE RACES
        Race race1Past = createRaceIfNotExist(tour1, "Chặng 1 - Cúp Khai Mạc Mùa Xuân", LocalDateTime.of(2026, 1, 16, 14, 0), RaceStatus.COMPLETED, referee1, new BigDecimal("10000000.00"), new BigDecimal("5000000.00"), new BigDecimal("2000000.00"));
        Race race2Betting = createRaceIfNotExist(tour2, "Chặng 2 - Vòng Loại Bán Kết Bet989", LocalDateTime.of(2026, 8, 7, 20, 30), RaceStatus.BETTING, referee1, new BigDecimal("25000000.00"), new BigDecimal("10000000.00"), new BigDecimal("5000000.00"));
        Race race3Betting = createRaceIfNotExist(tour2, "Chặng 3 - Thách Đấu Siêu Cúp Bet989", LocalDateTime.of(2026, 8, 8, 18, 0), RaceStatus.BETTING, referee2, new BigDecimal("30000000.00"), new BigDecimal("15000000.00"), new BigDecimal("7000000.00"));
        Race race4Reg = createRaceIfNotExist(tour2, "Chặng 4 - Chung Kết Siêu Cúp Bet989", LocalDateTime.of(2026, 8, 15, 16, 0), RaceStatus.REGISTRATION, referee1, new BigDecimal("50000000.00"), new BigDecimal("25000000.00"), new BigDecimal("10000000.00"));

        // 6. REGISTRATIONS FOR RACES
        // Race 1 (Past)
        Registration reg1 = createRegistrationIfNotExist(race1Past, horse2, ownerDinh, jockeyHung, RegistrationStatus.APPROVED_BY_ADMIN, 1, 1, 56.0, 56.0, 2.0, true, new BigDecimal("2.20"));
        Registration reg2 = createRegistrationIfNotExist(race1Past, horse6, ownerDinh, jockeyTuan, RegistrationStatus.APPROVED_BY_ADMIN, 2, 2, 55.0, 55.0, 1.0, true, new BigDecimal("3.50"));

        // Race 2 (BETTING Live)
        Registration reg3 = createRegistrationIfNotExist(race2Betting, horse2, ownerDinh, jockeyHung, RegistrationStatus.APPROVED_BY_ADMIN, 1, null, 56.0, 56.0, 2.0, true, new BigDecimal("2.50"));
        Registration reg4 = createRegistrationIfNotExist(race2Betting, horse6, ownerDinh, jockeyTuan, RegistrationStatus.APPROVED_BY_ADMIN, 2, null, 55.0, 55.0, 1.0, true, new BigDecimal("3.20"));
        Registration reg5 = createRegistrationIfNotExist(race2Betting, horse3, ownerMinh, jockeyBao, RegistrationStatus.APPROVED_BY_ADMIN, 3, null, 54.0, 54.0, 0.0, true, new BigDecimal("4.50"));

        // Race 3 (BETTING Live)
        Registration reg6 = createRegistrationIfNotExist(race3Betting, horse2, ownerDinh, jockeyTuan, RegistrationStatus.APPROVED_BY_ADMIN, 1, null, 56.0, 56.0, 1.5, true, new BigDecimal("2.10"));
        Registration reg7 = createRegistrationIfNotExist(race3Betting, horse3, ownerMinh, jockeyHung, RegistrationStatus.APPROVED_BY_ADMIN, 2, null, 54.0, 54.0, 0.0, true, new BigDecimal("3.80"));

        // Race 4 (REGISTRATION)
        Registration reg8 = createRegistrationIfNotExist(race4Reg, horse4, ownerMinh, null, RegistrationStatus.WAITING_JOCKEY, null, null, 53.0, 0.0, 0.0, false, null);

        // 7. BETS & TRANSACTIONS
        // Past Bets
        createBetIfNotExist(spectatorKhang, race1Past, BetType.WIN, reg1, null, new BigDecimal("5000000.00"), new BigDecimal("2.20"), BetStatus.WON, new BigDecimal("11000000.00"), new BigDecimal("11000000.00"), new BigDecimal("10900000.00"));
        
        // Active Bets for Live Race 2
        createBetIfNotExist(spectatorKhang, race2Betting, BetType.WIN, reg3, null, new BigDecimal("10000000.00"), new BigDecimal("2.50"), BetStatus.PENDING, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        createBetIfNotExist(spectatorNam, race2Betting, BetType.WIN, reg4, null, new BigDecimal("5000000.00"), new BigDecimal("3.20"), BetStatus.PENDING, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        createBetIfNotExist(spectatorLan, race2Betting, BetType.PLACE, reg5, null, new BigDecimal("3000000.00"), new BigDecimal("4.50"), BetStatus.PENDING, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);

        log.info("Sample database seeding completed successfully! Test accounts ready.");
    }

    private User createUserIfNotExist(String username, String password, String email, String phone, RoleEnum role, LocalDate dob, Double weight, Double height) {
        return userRepository.findByUsername(username).orElseGet(() -> {
            User u = User.builder()
                    .username(username)
                    .password(password)
                    .email(email)
                    .phoneNumber(phone)
                    .role(role)
                    .dob(dob)
                    .weight(weight)
                    .height(height)
                    .status(UserStatus.APPROVED)
                    .agreedRule1(true)
                    .agreedRule2(true)
                    .agreedRule3(true)
                    .agreedRule4(true)
                    .idNumber("079" + (int)(Math.random() * 100000000))
                    .pinCode("123456")
                    .createdAt(LocalDateTime.now())
                    .build();
            return userRepository.save(u);
        });
    }

    private void createAttachmentIfMissing(User user, UserDocType docType, String url) {
        boolean exists = user.getAttachments().stream().anyMatch(a -> a.getDocType() == docType);
        if (!exists) {
            UserAttachment att = UserAttachment.builder()
                    .user(user)
                    .docType(docType)
                    .fileUrl(url)
                    .build();
            userAttachmentRepository.save(att);
            user.getAttachments().add(att);
        }
    }

    private void createWalletIfNotExist(User user, BigDecimal balance) {
        if (walletRepository.findByUserId(user.getId()).isEmpty()) {
            Wallet w = Wallet.builder()
                    .user(user)
                    .balance(balance)
                    .build();
            walletRepository.save(w);
        }
    }

    private Horse createHorseIfNotExist(String name, User owner, int age, String breed, String color, int rating, int classLevel, int totalRaces, int winRaces) {
        return horseRepository.findByName(name).orElseGet(() -> {
            Horse h = Horse.builder()
                    .name(name)
                    .owner(owner)
                    .age(age)
                    .breed(breed)
                    .color(color)
                    .rating(rating)
                    .classLevel(classLevel)
                    .totalRaces(totalRaces)
                    .winRaces(winRaces)
                    .status(HorseStatus.APPROVED)
                    .healthStatus("Rất Tốt")
                    .microchipCode("CHIP-" + (int)(Math.random() * 899999 + 100000))
                    .lastHealthCheck(LocalDateTime.now().minusDays(2))
                    .createdAt(LocalDateTime.now())
                    .build();
            return horseRepository.save(h);
        });
    }

    private Tournament createTournamentIfNotExist(String name, LocalDateTime start, LocalDateTime end, TournamentStatus status, int requiredClass) {
        return tournamentRepository.findByName(name).orElseGet(() -> {
            Tournament t = Tournament.builder()
                    .name(name)
                    .startDate(start)
                    .endDate(end)
                    .status(status)
                    .requiredClass(requiredClass)
                    .build();
            return tournamentRepository.save(t);
        });
    }

    private Race createRaceIfNotExist(Tournament tournament, String name, LocalDateTime time, RaceStatus status, User referee, BigDecimal prize1, BigDecimal prize2, BigDecimal prize3) {
        return raceRepository.findByTournamentId(tournament.getId()).stream()
                .filter(r -> r.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> {
                    Race r = Race.builder()
                            .tournament(tournament)
                            .name(name)
                            .raceTime(time)
                            .status(status)
                            .referee(referee)
                            .prize1(prize1)
                            .prize2(prize2)
                            .prize3(prize3)
                            .rakePercentage(new BigDecimal("20.00"))
                            .totalPool(BigDecimal.ZERO)
                            .build();
                    return raceRepository.save(r);
                });
    }

    private Registration createRegistrationIfNotExist(Race race, Horse horse, User owner, User jockey, RegistrationStatus status, Integer gate, Integer rank, Double assignedWeight, Double actualWeight, Double leadWeight, boolean weighedIn, BigDecimal odds) {
        return registrationRepository.findByRaceIdAndHorseId(race.getId(), horse.getId()).orElseGet(() -> {
            Registration reg = Registration.builder()
                    .race(race)
                    .horse(horse)
                    .owner(owner)
                    .jockey(jockey)
                    .status(status)
                    .gateNumber(gate)
                    .rank(rank)
                    .assignedWeight(assignedWeight)
                    .actualWeight(actualWeight)
                    .leadWeight(leadWeight)
                    .isWeighedIn(weighedIn)
                    .odds(odds)
                    .build();
            return registrationRepository.save(reg);
        });
    }

    private void createBetIfNotExist(User spectator, Race race, BetType betType, Registration reg1, Registration reg2, BigDecimal amount, BigDecimal expectedOdds, BetStatus status, BigDecimal reward, BigDecimal grossPayout, BigDecimal netPayout) {
        Bet b = Bet.builder()
                .spectator(spectator)
                .race(race)
                .betType(betType)
                .registration(reg1)
                .registration2(reg2)
                .amount(amount)
                .expectedOdds(expectedOdds)
                .status(status)
                .reward(reward)
                .grossPayout(grossPayout)
                .netPayout(netPayout)
                .createdAt(LocalDateTime.now())
                .build();
        betRepository.save(b);
    }
}
