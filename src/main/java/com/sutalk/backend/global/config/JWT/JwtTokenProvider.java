package com.sutalk.backend.global.config.JWT;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    public String getUserId(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String createToken(String userId) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(userId)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + 3600000)) // 1시간
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }
}
