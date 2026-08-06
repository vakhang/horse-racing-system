package com.swp.horseracing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
    // [Chức năng rõ ràng]: Class Khởi chạy Ứng dụng (Main Class)
    // [Tác dụng]: Đây là trái tim của hệ thống Backend, nơi Spring Boot bắt đầu khởi động. Nó bao gồm hàm `main`, cấu hình múi giờ (Timezone) mặc định về Việt Nam và một đoạn code `CommandLineRunner` để tự động fix data cũ lúc khởi động.
    // [Hướng dẫn sửa đổi]:
    // - Logic: Nếu không cần chạy đoạn code tự động sửa data `initDummyAttachments` nữa, hãy comment hàm đó lại để ứng dụng khởi động nhanh hơn.
public class HorseracingApplication {

	@jakarta.annotation.PostConstruct
	public void init() {
		java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
	}

	public static void main(String[] args) {
		java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
		SpringApplication.run(HorseracingApplication.class, args);
	}

	@org.springframework.context.annotation.Bean
	public org.springframework.boot.CommandLineRunner initDummyAttachments(
			com.swp.horseracing.repository.UserRepository userRepo,
			com.swp.horseracing.repository.UserAttachmentRepository attachmentRepo,
			com.swp.horseracing.repository.TransactionHistoryRepository txRepo,
			org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				// Cập nhật các giao dịch cũ bị thiếu type và direction
				java.util.List<com.swp.horseracing.model.TransactionHistory> allTxs = txRepo.findAll();
				for (com.swp.horseracing.model.TransactionHistory tx : allTxs) {
					boolean changed = false;
					if (tx.getTransactionCode() != null && tx.getTransactionCode().startsWith("BONUS-") && tx.getDirection() == null) {
						tx.setType(com.swp.horseracing.model.TransactionType.DEPOSIT);
						tx.setDirection(com.swp.horseracing.model.TransactionDirection.IN);
						tx.setStatus(com.swp.horseracing.model.TransactionStatus.COMPLETED);
						changed = true;
					}
					if (tx.getTransactionCode() != null && tx.getTransactionCode().startsWith("NAP") && tx.getDirection() == null) {
						tx.setType(com.swp.horseracing.model.TransactionType.DEPOSIT);
						tx.setDirection(com.swp.horseracing.model.TransactionDirection.IN);
						tx.setStatus(com.swp.horseracing.model.TransactionStatus.COMPLETED);
						changed = true;
					}
					if (changed) {
						txRepo.save(tx);
					}
				}

				// Cập nhật created_at bị sai múi giờ (updatable=false nên phải dùng native SQL)
				jdbcTemplate.update("UPDATE transaction_histories SET created_at = created_at + interval '7 hours' WHERE EXTRACT(HOUR FROM created_at) < 14 AND EXTRACT(DAY FROM created_at) = 29 AND EXTRACT(MONTH FROM created_at) = 7 AND EXTRACT(YEAR FROM created_at) = 2026");

				java.util.List<com.swp.horseracing.model.User> users = userRepo.findAll();
				String dummyUrl = "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";
				
				java.util.List<com.swp.horseracing.model.UserAttachment> toDelete = new java.util.ArrayList<>();
				java.util.List<com.swp.horseracing.model.UserAttachment> newAtts = new java.util.ArrayList<>();

				for (com.swp.horseracing.model.User u : users) {
					java.util.List<com.swp.horseracing.model.UserAttachment> attachments = attachmentRepo.findByUserId(u.getId());
					
					boolean hasIdCard = false;
					
					for (com.swp.horseracing.model.UserAttachment a : attachments) {
						if (a.getDocType() == com.swp.horseracing.model.UserDocType.ID_CARD) {
							hasIdCard = true;
						} else if ((a.getDocType() == com.swp.horseracing.model.UserDocType.JOCKEY_CERT || 
									a.getDocType() == com.swp.horseracing.model.UserDocType.HEALTH_CHECK) && 
								   dummyUrl.equals(a.getFileUrl())) {
							// Xóa các chứng chỉ ảo đã lỡ tạo để user có thể tự test upload
							toDelete.add(a);
						}
					}

					if (!hasIdCard) {
						newAtts.add(com.swp.horseracing.model.UserAttachment.builder().user(u).docType(com.swp.horseracing.model.UserDocType.ID_CARD).fileUrl(dummyUrl).build());
					}
				}

				if (!toDelete.isEmpty()) {
					attachmentRepo.deleteAll(toDelete);
				}
				if (!newAtts.isEmpty()) {
					attachmentRepo.saveAll(newAtts);
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		};
	}
}
