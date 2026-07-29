package com.swp.horseracing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HorseracingApplication {

	public static void main(String[] args) {
		SpringApplication.run(HorseracingApplication.class, args);
	}

	@org.springframework.beans.factory.annotation.Autowired
	private com.swp.horseracing.repository.UserRepository userRepository;

	@org.springframework.beans.factory.annotation.Autowired
	private com.swp.horseracing.repository.WalletRepository walletRepository;

	@org.springframework.beans.factory.annotation.Autowired
	private com.swp.horseracing.repository.TransactionHistoryRepository transactionHistoryRepository;

}
