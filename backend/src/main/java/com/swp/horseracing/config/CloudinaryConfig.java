package com.swp.horseracing.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {
    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    // [Chức năng rõ ràng]: Cấu hình Cloudinary (Dịch vụ lưu trữ ảnh)
    // [Tác dụng]: Đọc API Key từ file `application.properties` để khởi tạo kết nối với Cloudinary. Giúp Backend có thể upload ảnh (Avatar, Ngựa, CMND).
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Không sửa cứng API key ở đây. Nếu muốn đổi tài khoản Cloudinary, hãy mở file `application.properties` (hoặc biến môi trường trên Railway) và đổi giá trị của `cloudinary.cloud-name`, `api-key`, `api-secret`.
    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);
        return new Cloudinary(config);
    }
}
