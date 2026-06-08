package com.swp.horseracing.service;

import com.swp.horseracing.model.Wallet;
import java.math.BigDecimal;

public interface WalletService {
    Wallet getWalletByUserId(Integer userId);
    Wallet depositMoney(Integer userId, BigDecimal amount);
    String requestWithdrawal(Integer userId);

}