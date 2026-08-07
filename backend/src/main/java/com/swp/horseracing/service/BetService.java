package com.swp.horseracing.service;

import com.swp.horseracing.model.Bet;
import com.swp.horseracing.model.Race;
import com.swp.horseracing.dto.BetRequestDTO;

// [Chức năng rõ ràng]: Interface Service Đặt Cược
// [Tác dụng]: Định nghĩa các hàm tạo vé cược và quyết toán kết quả cho người chơi.
public interface BetService {
    Bet createBet(BetRequestDTO request);
    void calculateAndPayoutRewards(Race race);
}