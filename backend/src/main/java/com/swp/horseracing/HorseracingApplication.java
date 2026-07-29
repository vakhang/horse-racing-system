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
	public void fixReferee3Role() {
		java.util.List<com.swp.horseracing.model.User> users = userRepository.findAll();
		for (com.swp.horseracing.model.User u : users) {
			if (u.getEmail() != null && u.getEmail().toLowerCase().contains("referee3")) {
				if (u.getRole() != com.swp.horseracing.model.RoleEnum.REFEREE) {
					System.out.println("Cập nhật role cho: " + u.getEmail());
					u.setRole(com.swp.horseracing.model.RoleEnum.REFEREE);
					userRepository.save(u);
				}
			}
		}
	}

}
