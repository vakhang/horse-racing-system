package com.swp.horseracing.service;

import com.swp.horseracing.dto.RefereeResultRequestDTO;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional // Tự động xóa sạch dữ liệu ảo sau khi test xong, không làm rác DB thật
public class RefereeServiceIntegrationTest {

    @Autowired private RefereeService refereeService;
    @Autowired private UserRepository userRepository;
    @Autowired private WalletRepository walletRepository;
    @Autowired private RaceRepository raceRepository;
    @Autowired private HorseRepository horseRepository;
    @Autowired private RegistrationRepository registrationRepository;
    @Autowired private BetRepository betRepository;
    @Autowired private TransactionHistoryRepository transactionHistoryRepository;

    @Test
    public void testSubmitRaceResult_HappyPath() {
        System.out.println("\n=============================================");
        System.out.println("[LOG BÁO CÁO] BẮT ĐẦU CHẠY KỊCH BẢN TEST");
        System.out.println("=============================================\n");

        // 1. SETUP DỮ LIỆU ẢO
        System.out.println("[LOG BÁO CÁO] 1. Khởi tạo dữ liệu ảo (User, Wallet, Race, Bet)...");
        
        User player = userRepository.save(User.builder()
                .username("nguoichoitamlinh")
                .password("123456")
                .email("test@gmail.com")
                .role(RoleEnum.SPECTATOR)
                .build());

        Wallet wallet = walletRepository.save(Wallet.builder()
                .user(player)
                .balance(new BigDecimal("100000")) // Vốn 100k
                .build());

        System.out.println("[LOG BÁO CÁO] + Số dư ví ban đầu: " + wallet.getBalance() + " VNĐ");

        Race race = raceRepository.save(Race.builder()
                .name("Chặng Đua Mùa Xuân")
                .raceTime(LocalDateTime.now())
                .status(RaceStatus.RUNNING)
                .build());

        Horse horse = horseRepository.save(Horse.builder()
                .name("Ngựa Xích Thố")
                .build());

        Registration registration = registrationRepository.save(Registration.builder()
                .race(race)
                .horse(horse)
                .build());

        Bet bet = betRepository.save(Bet.builder()
                .user(player)
                .race(race)
                .registration(registration)
                .amount(new BigDecimal("10000")) // Cược 10k
                .odds(new BigDecimal("2.0")) // Tỷ lệ 1 ăn 2
                .status(BetStatus.PENDING)
                .build());

        System.out.println("[LOG BÁO CÁO] + Người chơi cược " + bet.getAmount() + " VNĐ vào " + horse.getName() + " (Tỷ lệ: " + bet.getOdds() + ")");

        // 2. GỌI API TRỌNG TÀI
        System.out.println("\n[LOG BÁO CÁO] 2. Trọng tài gọi API chốt kết quả: Ngựa Xích Thố về Nhất!");
        RefereeResultRequestDTO request = new RefereeResultRequestDTO();
        request.setRaceId(race.getId());
        request.setTop1RegistrationId(registration.getId());

        String resultMsg = refereeService.submitRaceResult(request);
        System.out.println("[LOG BÁO CÁO] + API Trả về: " + resultMsg);

        // 3. KIỂM ĐỊNH (ASSERT) & BÁO CÁO
        System.out.println("\n[LOG BÁO CÁO] 3. Kiểm định kết quả sau khi trả thưởng...");
        
        Race updatedRace = raceRepository.findById(race.getId()).get();
        assertEquals(RaceStatus.FINISHED, updatedRace.getStatus());
        System.out.println("[LOG BÁO CÁO] + Trạng thái chặng đua đã chuyển thành: " + updatedRace.getStatus());

        Bet updatedBet = betRepository.findById(bet.getId()).get();
        assertEquals(BetStatus.WON, updatedBet.getStatus());
        System.out.println("[LOG BÁO CÁO] + Trạng thái vé cược đã chuyển thành: " + updatedBet.getStatus());

        Wallet updatedWallet = walletRepository.findById(wallet.getId()).get();
        // 100k + (10k * 2) = 120k
        assertEquals(0, new BigDecimal("120000").compareTo(updatedWallet.getBalance()));
        System.out.println("[LOG BÁO CÁO] + Số dư ví hiện tại: " + updatedWallet.getBalance() + " VNĐ (Chuẩn xác 100%)");

        List<TransactionHistory> txs = transactionHistoryRepository.findAll();
        TransactionHistory lastTx = txs.get(txs.size() - 1);
        System.out.println("[LOG BÁO CÁO] + Đã in biên lai giao dịch: " + lastTx.getTransactionCode() + " | +" + lastTx.getAmount() + " | Loại: " + lastTx.getType());

        System.out.println("\n=============================================");
        System.out.println("✅ [LOG BÁO CÁO] KỊCH BẢN TEST HOÀN HẢO! BẠN CÓ THỂ CHỤP ẢNH MÀN HÌNH NÀY.");
        System.out.println("=============================================\n");
    }
}
