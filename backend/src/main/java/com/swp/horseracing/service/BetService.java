package com.swp.horseracing.service;

import com.swp.horseracing.model.Bet;
import com.swp.horseracing.dto.BetRequestDTO;

    // [Chức năng rõ ràng]: Interface Service Đặt Cược
    // [Tác dụng]: Định nghĩa hàm tạo vé cược cho người chơi.
    // [Hướng dẫn sửa đổi]:
    // - Logic: Thêm hàm hủy cược nếu cần.
public interface BetService {
    Bet createBet(BetRequestDTO request);
}