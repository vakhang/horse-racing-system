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

	@jakarta.annotation.PostConstruct
	public void fillMissingAttachments() {
		java.util.List<com.swp.horseracing.model.User> users = userRepository.findAll();
		String dummyUrl = "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";
		for (com.swp.horseracing.model.User u : users) {
			java.util.List<com.swp.horseracing.model.UserAttachment> attachments = u.getAttachments();
			if (attachments == null) attachments = new java.util.ArrayList<>();
			
			boolean hasIdCard = attachments.stream().anyMatch(a -> a.getDocType() == com.swp.horseracing.model.UserDocType.ID_CARD);
			boolean hasCert = attachments.stream().anyMatch(a -> a.getDocType() == com.swp.horseracing.model.UserDocType.CERTIFICATE);
			boolean hasHealth = attachments.stream().anyMatch(a -> a.getDocType() == com.swp.horseracing.model.UserDocType.HEALTH_CHECK);

			boolean added = false;
			if (!hasIdCard) {
				attachments.add(com.swp.horseracing.model.UserAttachment.builder().user(u).docType(com.swp.horseracing.model.UserDocType.ID_CARD).fileUrl(dummyUrl).build());
				added = true;
			}

			if (u.getRole() == com.swp.horseracing.model.RoleEnum.JOCKEY) {
				if (!hasCert) {
					attachments.add(com.swp.horseracing.model.UserAttachment.builder().user(u).docType(com.swp.horseracing.model.UserDocType.CERTIFICATE).fileUrl(dummyUrl).build());
					added = true;
				}
				if (!hasHealth) {
					attachments.add(com.swp.horseracing.model.UserAttachment.builder().user(u).docType(com.swp.horseracing.model.UserDocType.HEALTH_CHECK).fileUrl(dummyUrl).build());
					added = true;
				}
			} else if (u.getRole() == com.swp.horseracing.model.RoleEnum.REFEREE) {
				if (!hasCert) {
					attachments.add(com.swp.horseracing.model.UserAttachment.builder().user(u).docType(com.swp.horseracing.model.UserDocType.CERTIFICATE).fileUrl(dummyUrl).build());
					added = true;
				}
			}

			if (added) {
				userRepository.save(u);
			}
		}
	}

}
