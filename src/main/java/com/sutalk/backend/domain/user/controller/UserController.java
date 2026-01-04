package com.sutalk.backend.domain.user.controller;

import com.sutalk.backend.domain.user.dto.LoginResponseDTO;
import com.sutalk.backend.domain.user.dto.UserProfileResponseDTO;
import com.sutalk.backend.domain.review.entity.Review;
import com.sutalk.backend.domain.user.entity.User;
import com.sutalk.backend.domain.item.repository.ItemRepository;
import com.sutalk.backend.domain.transaction.repository.ItemTransactionRepository;
import com.sutalk.backend.domain.review.repository.ReviewRepository;
import com.sutalk.backend.domain.user.repository.UserRepository;
import com.sutalk.backend.global.config.JWT.JwtTokenProvider;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@CrossOrigin(origins = "https://sutalkmarket.shop")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final JwtTokenProvider jwtTokenProvider;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;

    private final ItemTransactionRepository itemTransactionRepository;
    @Autowired
    PasswordEncoder passwordEncoder;
    private final Path PROFILE_ROOT = Paths.get(System.getProperty("user.dir"), "uploads", "profiles");

    // ✅ 판매자 프로필 정보 + 평균 별점 + 후기 개수
    @GetMapping("/{userid}")
    public ResponseEntity<UserProfileResponseDTO> getUserProfile(@PathVariable String userid) {
        User user = userRepository.findById(userid)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Double avg = reviewRepository.findAverageRatingByUser(user);
        int count = reviewRepository.countByReviewee(user);

        UserProfileResponseDTO dto = UserProfileResponseDTO.builder()
                .userid(user.getUserid())
                .name(user.getName())
                .email(user.getEmail())
                .averageRating(avg != null ? avg : 0.0)
                .reviewCount(count)
                .profileImage(user.getProfileImage())
                .build();

        return ResponseEntity.ok(dto);
    }

    // ✅ 받은 후기 리스트 조회
    @GetMapping("/{userid}/reviews")
    public List<Review> getReviewsForUser(@PathVariable String userid) {
        return reviewRepository.findByReviewee_Userid(userid);
    }

    // ✅ 회원가입
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        if (userRepository.existsById(user.getUserid())) {
            throw new RuntimeException("이미 존재하는 ID입니다.");
        }

        // ✅ 비밀번호 암호화
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }
    // ✅ 로그인 시 JWT 발급 + 사용자 이름(name) 포함 응답
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        String password = body.get("password");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 ID입니다."));
        System.out.println("입력 PW: " + password);
        System.out.println("DB PW: " + user.getPassword());
        System.out.println("matches 결과: " + passwordEncoder.matches(password, user.getPassword()));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "비밀번호가 일치하지 않습니다."));
        }

        String accessToken = jwtTokenProvider.createToken(user.getUserid());
        LoginResponseDTO dto = new LoginResponseDTO(
                user.getUserid(),
                user.getName(),
                accessToken
        );

        return ResponseEntity.ok(dto);
    }

    // ✅ 이름(닉네임) 변경 API
    @PatchMapping("/{userid}/name")
    @Transactional
    public ResponseEntity<?> updateName(
            @PathVariable String userid,
            @RequestBody Map<String, String> body
    ) {
        String newName = body.get("name");

        User user = userRepository.findById(userid)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        user.setName(newName);
        userRepository.save(user);

        return ResponseEntity.ok("이름(닉네임)이 성공적으로 변경되었습니다.");
    }

    // ✅ 프로필 이미지 업로드 API
    @PostMapping("/{userid}/profile-image")
    @Transactional
    public ResponseEntity<?> uploadProfileImage(
            @PathVariable String userid,
            @RequestParam("file") MultipartFile file
    ) {
        User user = userRepository.findById(userid)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        try {
            Files.createDirectories(PROFILE_ROOT);
            String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + "." + ext;
            Path savePath = PROFILE_ROOT.resolve(filename);
            Files.copy(file.getInputStream(), savePath, StandardCopyOption.REPLACE_EXISTING);

            user.setProfileImage("/uploads/profiles/" + filename);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "프로필 이미지 업로드 완료",
                    "imageUrl", "/uploads/profiles/" + filename
            ));
        } catch (IOException e) {
            return ResponseEntity.status(500)
                    .body("이미지 업로드 실패: " + e.getMessage());
        }
    }
}
