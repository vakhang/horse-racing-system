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
		
		userRepository.findByEmail("spectator2@gmail.com").ifPresent(u -> {
			u.setIdNumber("B1234567");
			u.setIdIssueDate(java.time.LocalDate.of(2022, 1, 10));
			u.setIdIssuePlace("Cục QL xuất nhập cảnh");
			if (u.getPinCode() == null || u.getPinCode().isEmpty()) {
				u.setPinCode("123456");
			}
			userRepository.save(u);
		});

		userRepository.findByEmail("referee2@gmail.com").ifPresent(u -> {
			u.setRole(com.swp.horseracing.model.RoleEnum.REFEREE);
			u.setIdIssueDate(java.time.LocalDate.of(2023, 2, 28));
			u.setIdIssuePlace("Cục QL xuất nhập cảnh");
			u.setPinCode("890123");
			userRepository.save(u);
		});
	}

}
