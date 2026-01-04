package com.sutalk.backend.global.config.JWT;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@RequiredArgsConstructor
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // ✅ WebSocket handshake 및 SockJS 초기 연결은 JWT 검증 제외
        // (STOMP 연결 시 /ws/info, /ws/** 로 요청이 들어오기 때문)
        if (path.startsWith("/ws")) {
            System.out.println("⚙️ WebSocket handshake 요청 감지 → JWT 필터 통과 허용");
            filterChain.doFilter(request, response);
            return;
        }

        // ✅ 기존 JWT 인증 로직 그대로 유지
        String token = resolveToken(request);
        System.out.println("🔍 JWT 필터 동작: " + token);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            String userId = jwtTokenProvider.getUserId(token);

            // ✅ SecurityContext 명시적 생성 및 주입
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null, Collections.emptyList());
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            System.out.println("✅ JWT 인증 성공: " + userId);
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
