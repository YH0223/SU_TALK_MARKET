package com.sutalk.backend.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // ✅ 업로드 폴더 절대 경로
        Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads");
        String uploadPath = uploadDir.toUri().toString();

        System.out.println("✅ [WebConfig] Serving static uploads from: " + uploadPath);

        // ✅ 정적 리소스 매핑 (/uploads/** → 실제 폴더)
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath.startsWith("file:") ? uploadPath : "file:" + uploadPath)
                .setCachePeriod(0); // ❗ 개발 단계에서는 캐시 방지
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("https://sutalkmarket.shop") // ✅ 프론트 주소
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
