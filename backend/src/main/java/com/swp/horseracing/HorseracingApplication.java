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

	@jakarta.annotation.PostConstruct
	public void fixPinCode() {
		userRepository.findByEmail("spectator1@gmail.com").ifPresent(u -> {
			if (u.getPinCode() == null || u.getPinCode().isEmpty()) {
				u.setPinCode("123456");
				userRepository.save(u);
			}
		});
	}

}
