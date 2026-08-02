package com.swp.horseracing.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    // Use a fixed key so tokens remain valid across backend restarts
    private final String SECRET = "HorseRacingVnSuperSecretKey2026-HorseRacingVnSuperSecretKey2026!";
    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    // [Chức năng rõ ràng]: Khởi tạo Token Đăng nhập (JWT)
    // [Tác dụng]: Sinh ra một chuỗi mã JWT chứa thông tin userId và role. Chuỗi này dùng làm "thẻ căn cước" cho người dùng khi gọi API.
    // [Hướng dẫn sửa đổi]:
    // - Logic/Data: Để đổi thời gian sống của Token, hãy thay đổi số `EXPIRATION_TIME` bên dưới (mặc định đang là 86400000ms = 24 giờ). Đổi khóa bí mật ở biến `SECRET` phía trên.
    public String generateToken(Integer userId, String role) {

        long EXPIRATION_TIME = 86400000;

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }


    public Integer getUserIdFromToken(String token) {

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return Integer.parseInt(claims.getSubject());
    }


    public String getRoleFromToken(String token) {

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.get("role", String.class);
    }


    public boolean validateToken(String token) {

        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);

            return true;

        } catch(Exception e){
            return false;
        }
    }
}