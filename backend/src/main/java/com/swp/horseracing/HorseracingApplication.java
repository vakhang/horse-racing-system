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
		userRepository.findByEmail("referee3@gmail.com").ifPresent(u -> {
			if (u.getRole() != com.swp.horseracing.model.RoleEnum.REFEREE) {
				System.out.println("Role hiện tại của referee3 là: " + u.getRole() + ", tiến hành cập nhật thành REFEREE.");
				u.setRole(com.swp.horseracing.model.RoleEnum.REFEREE);
				userRepository.save(u);
			} else {
				System.out.println("Role của referee3 đã là REFEREE, không cần cập nhật.");
			}
		});
	}

}
