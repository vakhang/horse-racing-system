package com.swp.horseracing.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Mở cửa cho toàn bộ API
                .allowedOrigins("http://localhost:3000") // Cho phép React (cổng 3000) gọi vào
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Các thao tác cho phép
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}