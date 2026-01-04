package com.sutalk.backend.global.config.OAuth2;

import com.sutalk.backend.domain.user.entity.User;
import com.sutalk.backend.domain.user.repository.UserRepository;
import com.sutalk.backend.global.config.JWT.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // ✅ Google 프로필 정보
        String googleId = oAuth2User.getAttribute("sub");   // 고유 사용자 ID
        String email = oAuth2User.getAttribute("email");    // 이메일
        String name = oAuth2User.getAttribute("name");      // 이름

        // ✅ DB에 사용자 없으면 새로 등록
        userRepository.findByUserid(googleId).orElseGet(() -> {
            User newUser = User.builder()
                    .userid(googleId)
                    .email(email)
                    .name(name)
                    .phone("1111")        // ← 기본값
                    .status("ACTIVE")     // ← 기본 상태 (필요 시)
                    .password(null)       // ← 비밀번호 없음
                    .build();
            return userRepository.save(newUser);
        });

        // ✅ JWT 생성
        String token = jwtTokenProvider.createToken(googleId);

        // ✅ 프론트엔드로 리디렉트
        // ✅ JSON 대신 Redirect 방식
        String redirectUrl = "https://sutalkmarket.shop/oauth2/success"
                + "?token=" + token
                + "&userId=" + googleId
                + "&name=" + URLEncoder.encode(name, StandardCharsets.UTF_8);

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}