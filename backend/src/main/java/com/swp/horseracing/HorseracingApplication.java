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

		userRepository.findById(10).ifPresent(u -> {
			u.setRole(com.swp.horseracing.model.RoleEnum.REFEREE);
			u.setIdNumber("001082007890");
			userRepository.save(u);
		});
		userRepository.findById(14).ifPresent(u -> {
			u.setRole(com.swp.horseracing.model.RoleEnum.JOCKEY);
			userRepository.save(u);
		});
		userRepository.findById(4).ifPresent(u -> { u.setIdNumber("012098001234"); userRepository.save(u); });
		userRepository.findById(7).ifPresent(u -> { u.setIdNumber("079085009012"); userRepository.save(u); });
		userRepository.findById(9).ifPresent(u -> { u.setIdNumber("048206003456"); userRepository.save(u); });
		userRepository.findById(12).ifPresent(u -> { u.setIdNumber("024203001122"); userRepository.save(u); });
		userRepository.findById(13).ifPresent(u -> { u.setIdNumber("060099004455"); userRepository.save(u); });
		userRepository.findById(15).ifPresent(u -> { u.setIdNumber("080205008899"); userRepository.save(u); });
		userRepository.findById(16).ifPresent(u -> { u.setIdNumber("091207003344"); userRepository.save(u); });
	}

}
