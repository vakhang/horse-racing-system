package com.swp.horseracing.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    // [Chức năng rõ ràng]: Cấu hình CORS (Cross-Origin Resource Sharing)
    // [Tác dụng]: Cho phép Frontend (Vercel, Localhost) có thể gọi API tới Backend (Railway) mà không bị trình duyệt chặn lỗi CORS.
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Để bảo mật hơn, thay `.allowedOriginPatterns("*")` bằng tên miền cụ thể của Frontend như `.allowedOrigins("https://horse-racing-vercel.app")`.
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Mở cửa cho toàn bộ API
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}