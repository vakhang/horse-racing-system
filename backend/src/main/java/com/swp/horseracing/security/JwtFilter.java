package com.swp.horseracing.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
    // [Chức năng rõ ràng]: Bộ lọc chặn Request (Middleware)
    // [Tác dụng]: Can thiệp vào mọi API request gửi từ Frontend. Nó kiểm tra xem request có gửi kèm Token JWT hợp lệ hay không. Nếu có thì cho qua, nếu không thì chặn (401 Unauthorized).
    // [Hướng dẫn sửa đổi]:
    // - Logic: Sửa logic bóc tách header `Authorization` nếu hệ thống đổi sang dùng Cookie.
public class JwtFilter extends OncePerRequestFilter {


    private final JwtUtils jwtUtils;


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {


        String authHeader = request.getHeader("Authorization");


        if(authHeader != null && authHeader.startsWith("Bearer ")) {


            String token = authHeader.substring(7);


            if(jwtUtils.validateToken(token)) {


                Integer userId = jwtUtils.getUserIdFromToken(token);

                String role = jwtUtils.getRoleFromToken(token);


                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                List.of(
                                        new SimpleGrantedAuthority("ROLE_" + role)
                                )
                        );


                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);
            }
        }


        filterChain.doFilter(request,response);
    }
}