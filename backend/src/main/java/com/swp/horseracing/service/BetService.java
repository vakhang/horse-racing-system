package com.swp.horseracing.service;

import com.swp.horseracing.model.Bet;
import com.swp.horseracing.dto.BetRequestDTO;

public interface BetService {
    Bet createBet(BetRequestDTO request);
}