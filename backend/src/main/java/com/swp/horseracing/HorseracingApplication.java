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
	private com.swp.horseracing.repository.UserAttachmentRepository userAttachmentRepository;

	@jakarta.annotation.PostConstruct
	public void fillMissingAttachments() {
		java.util.List<com.swp.horseracing.model.User> users = userRepository.findAll();
		String dummyUrl = "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";
		for (com.swp.horseracing.model.User u : users) {
			java.util.List<com.swp.horseracing.model.UserAttachment> attachments = u.getAttachments();
			if (attachments == null) {
				attachments = new java.util.ArrayList<>();
				u.setAttachments(attachments);
			}
			
			boolean hasIdCard = attachments.stream().anyMatch(a -> a.getDocType() == com.swp.horseracing.model.UserDocType.ID_CARD);
			boolean hasCert = attachments.stream().anyMatch(a -> a.getDocType() == com.swp.horseracing.model.UserDocType.JOCKEY_CERT);
			boolean hasHealth = attachments.stream().anyMatch(a -> a.getDocType() == com.swp.horseracing.model.UserDocType.HEALTH_CHECK);

			java.util.List<com.swp.horseracing.model.UserAttachment> newAtts = new java.util.ArrayList<>();
			if (!hasIdCard) {
				newAtts.add(com.swp.horseracing.model.UserAttachment.builder().user(u).docType(com.swp.horseracing.model.UserDocType.ID_CARD).fileUrl(dummyUrl).build());
			}

			if (u.getRole() == com.swp.horseracing.model.RoleEnum.JOCKEY) {
				if (!hasCert) {
					newAtts.add(com.swp.horseracing.model.UserAttachment.builder().user(u).docType(com.swp.horseracing.model.UserDocType.JOCKEY_CERT).fileUrl(dummyUrl).build());
				}
				if (!hasHealth) {
					newAtts.add(com.swp.horseracing.model.UserAttachment.builder().user(u).docType(com.swp.horseracing.model.UserDocType.HEALTH_CHECK).fileUrl(dummyUrl).build());
				}
			} else if (u.getRole() == com.swp.horseracing.model.RoleEnum.REFEREE) {
				if (!hasCert) {
					newAtts.add(com.swp.horseracing.model.UserAttachment.builder().user(u).docType(com.swp.horseracing.model.UserDocType.JOCKEY_CERT).fileUrl(dummyUrl).build());
				}
			}

			if (!newAtts.isEmpty()) {
				userAttachmentRepository.saveAll(newAtts);
			}
		}
	}

}
