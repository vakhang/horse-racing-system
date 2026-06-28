package com.swp.horseracing.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Lệnh này xài chung với CorsConfig của sếp, sếp cấu hình Cors ra sao nó chạy y vậy!
                .cors(Customizer.withDefaults())

                // Tắt CSRF đi vì mình xài Token rồi
                .csrf(csrf -> csrf.disable())

                // Ép hệ thống không lưu session
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()

                        // --- Cụm API phục vụ trang WalletPage ---
                        .requestMatchers("/api/wallets/deposit").permitAll()
                        .requestMatchers("/api/wallets/my-wallet").permitAll()
                        .requestMatchers("/api/users/my-transactions").permitAll() // 🎯 Thêm luôn ông này cho chắc chắn
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated()
                )

                // Gắn ông bảo vệ vào soát vé
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}