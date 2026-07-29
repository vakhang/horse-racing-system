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

	@jakarta.annotation.PostConstruct
	public void cleanupTestAccounts() {
		String[] emailsToDelete = {
			"spectator3@gmail.com",
			"owner3@gmail.com",
			"referee3@gmail.com",
			"jockey4@gmail.com"
		};

		for (String email : emailsToDelete) {
			userRepository.findByEmail(email).ifPresent(u -> {
				walletRepository.findByUserId(u.getId()).ifPresent(wallet -> {
					java.util.List<com.swp.horseracing.model.TransactionHistory> txs = transactionHistoryRepository.findByWallet_UserIdOrderByCreatedAtDesc(u.getId());
					if (!txs.isEmpty()) {
						transactionHistoryRepository.deleteAll(txs);
					}
					walletRepository.delete(wallet);
				});
				userRepository.delete(u);
			});
		}
	}

}
