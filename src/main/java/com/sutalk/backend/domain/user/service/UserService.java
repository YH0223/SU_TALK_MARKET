package com.sutalk.backend.domain.user.service;

import com.sutalk.backend.domain.user.dto.UserProfileResponseDTO;
import com.sutalk.backend.domain.review.entity.Review;
import com.sutalk.backend.domain.user.entity.User;
import com.sutalk.backend.domain.item.repository.ItemRepository;
import com.sutalk.backend.domain.transaction.repository.ItemTransactionRepository;
import com.sutalk.backend.domain.review.repository.ReviewRepository;
import com.sutalk.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 읽기 전용 메서드가 많으므로 클래스 레벨에 설정
public class UserService {

    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final ItemRepository itemRepository;
    private final ItemTransactionRepository itemTransactionRepository;

    // 사용자 프로필 정보 조회
    public UserProfileResponseDTO getUserProfile(String userId) {
        User user = findUserById(userId);

        Double avgRating = reviewRepository.findAverageRatingByUser(user);
        int reviewCount = reviewRepository.countByReviewee(user);

        return UserProfileResponseDTO.builder()
                .userid(user.getUserid())
                .name(user.getName())
                .email(user.getEmail())
                .averageRating(avgRating != null ? avgRating : 0.0)
                .reviewCount(reviewCount)
                .build();
    }

    // 사용자가 받은 후기 목록 조회
    public List<Review> getReviewsForUser(String userId) {
        return reviewRepository.findByReviewee_Userid(userId);
    }

    // 회원가입
    @Transactional // 쓰기 작업이므로 @Transactional을 명시
    public User createUser(User user) {
        if (userRepository.existsById(user.getUserid())) {
            throw new RuntimeException("이미 존재하는 ID입니다.");
        }
        userRepository.save(user);
        // 연관관계까지 포함된 완전한 User 객체를 반환
        return findUserByIdWithRelations(user.getUserid());
    }

    // 로그인 확인용 사용자 정보 조회 (연관관계 포함)
    public User getUserForLogin(String userId) {
        return findUserByIdWithRelations(userId);
    }

    // ID 사용 가능 여부 확인 (boolean 반환)
    public boolean isUserIdAvailable(String userId) {
        return !userRepository.existsById(userId);
    }

    // ID 변경
    @Transactional
    public void updateUserId(String oldUserId, String newUserId) {
        if (!userRepository.existsById(oldUserId)) {
            throw new RuntimeException("기존 사용자를 찾을 수 없습니다.");
        }
        if (userRepository.existsById(newUserId)) {
            throw new RuntimeException("이미 존재하는 ID입니다.");
        }

        User existingUser = findUserById(oldUserId);

        // 1. 새 ID로 사용자 객체 생성 및 저장
        User newUser = User.builder()
                .userid(newUserId)
                .email(existingUser.getEmail())
                .name(existingUser.getName())
                .password(existingUser.getPassword())
                .phone(existingUser.getPhone())
                .status(existingUser.getStatus())
                .build();
        userRepository.saveAndFlush(newUser);

        // 2. 연관된 테이블의 FK 업데이트
        itemRepository.updateSellerUserId(oldUserId, newUserId);
        itemRepository.updateBuyerUserId(oldUserId, newUserId);
        itemTransactionRepository.updateUserId(oldUserId, newUserId);
        // TODO: Review, Report, Chat 등 다른 테이블의 FK도 업데이트 필요

        // 3. 기존 사용자 삭제
        userRepository.deleteById(oldUserId);
    }

    // 중복 로직을 줄이기 위한 private 헬퍼 메서드
    private User findUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    private User findUserByIdWithRelations(String userId) {
        return userRepository.findByUserid(userId) // EntityGraph가 적용된 메서드 사용
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
}