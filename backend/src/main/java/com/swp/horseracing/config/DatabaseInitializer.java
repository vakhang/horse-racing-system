package com.swp.horseracing.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class DatabaseInitializer {

    // [Chức năng rõ ràng]: Khởi tạo Bảng (Table) tự động
    // [Tác dụng]: Chạy một lần duy nhất lúc server khởi động để tạo bảng `system_contents` (chứa dữ liệu bài viết) nếu nó chưa tồn tại trong PostgreSQL, giúp Admin có thể đăng bài.
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Nếu bạn muốn tự động tạo thêm một bảng mới nào đó, hãy copy cụm `jdbcTemplate.execute(...)` và dán câu lệnh SQL tạo bảng của bạn vào.
    @Bean
    public CommandLineRunner initDatabase(JdbcTemplate jdbcTemplate) {
        return args -> {
            log.info("Checking and creating necessary tables if they do not exist...");
            try {
                // Ensure system_contents table exists for PostgreSQL
                String createTableQuery = "CREATE TABLE IF NOT EXISTS system_contents (" +
                        "id SERIAL PRIMARY KEY, " +
                        "page_id VARCHAR(255) UNIQUE NOT NULL, " +
                        "title VARCHAR(255), " +
                        "content TEXT, " +
                        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                        "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";
                jdbcTemplate.execute(createTableQuery);
                log.info("Table system_contents is ready.");
            } catch (Exception e) {
                log.error("Failed to initialize database tables: ", e);
            }
        };
    }
}
