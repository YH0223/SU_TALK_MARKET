package com.sutalk.backend.domain.review.service;

import com.sutalk.backend.domain.review.dto.ReviewRequestDTO;
import com.sutalk.backend.domain.review.dto.ReviewResponseDTO;
import com.sutalk.backend.domain.review.dto.ReviewSummaryDTO;
import com.sutalk.backend.domain.item.entity.Item;
import com.sutalk.backend.domain.transaction.entity.ItemTransaction;
import com.sutalk.backend.domain.review.entity.Review;
import com.sutalk.backend.domain.user.entity.User;
import com.sutalk.backend.domain.item.repository.ItemRepository;
import com.sutalk.backend.domain.transaction.repository.ItemTransactionRepository;
import com.sutalk.backend.domain.review.repository.ReviewRepository;
import com.sutalk.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final ItemTransactionRepository itemTransactionRepository;

    /**
     * ✅ 판매자 기준 리뷰 요약 조회 (닉네임 = name 으로 표시)
     */
    public List<ReviewSummaryDTO> getReviewSummariesBySeller(String sellerId) {
        // 기존: return reviewRepository.findReviewSummariesBySellerId(sellerId);
        // 수정: 엔티티 직접 조회 + 변환
        List<Review> reviews = reviewRepository.findByReviewee_UseridOrderByCreatedAtDesc(sellerId);
        return reviews.stream()
                .map(r -> new ReviewSummaryDTO(
                        r.getComment(),
                        r.getRating(),
                        r.getCreatedAt(),
                        r.getReviewer().getName(),   // ✅ name 사용
                        r.getItem().getTitle()
                ))
                .collect(Collectors.toList());
    }

    /**
     * ✅ 판매자 기준 상세 리뷰 조회
     */
    public List<ReviewResponseDTO> getReviewsBySellerDetailed(String sellerId) {
        List<Review> reviews = reviewRepository.findByReviewee_UseridOrderByCreatedAtDesc(sellerId);
        return reviews.stream()
                .map(ReviewResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * ✅ 리뷰 작성
     */
    public void createReview(ReviewRequestDTO dto) {
        Item item = itemRepository.findById(dto.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        User buyer = userRepository.findById(dto.getBuyerId())
                .orElseThrow(() -> new IllegalArgumentException("Buyer not found"));
        User reviewee = userRepository.findById(dto.getRevieweeId())
                .orElseThrow(() -> new IllegalArgumentException("Reviewee not found"));
        ItemTransaction transaction = itemTransactionRepository.findById(dto.getTransactionId())
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        if (reviewRepository.existsByItemAndBuyer(item, buyer)) {
            throw new IllegalStateException("이미 리뷰를 작성했습니다.");
        }

        Review review = new Review();
        review.setItem(item);
        review.setBuyer(buyer);
        review.setReviewee(reviewee);
        review.setReviewer(buyer);
        review.setTransaction(transaction);
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());

        reviewRepository.save(review);
    }
}
