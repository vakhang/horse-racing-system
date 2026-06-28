package com.swp.horseracing.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "ddfzdsshk");
        config.put("api_key", "242973157458496");
        config.put("api_secret", "GTeOSTSI7Jo-XdrlzMkfaGmnFaU");
        return new Cloudinary(config);
    }
}