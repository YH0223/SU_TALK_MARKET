package com.sutalk.backend.domain.review.controller;

import com.sutalk.backend.domain.review.dto.ReviewRequestDTO;
import com.sutalk.backend.domain.review.dto.ReviewResponseDTO;
import com.sutalk.backend.domain.review.dto.ReviewSummaryDTO;
import com.sutalk.backend.domain.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody ReviewRequestDTO dto) {
        reviewService.createReview(dto);
        return ResponseEntity.ok("리뷰가 저장되었습니다.");
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<ReviewSummaryDTO>> getReviewsBySeller(@PathVariable String sellerId) {
        List<ReviewSummaryDTO> reviews = reviewService.getReviewSummariesBySeller(sellerId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/seller/{sellerId}/detailed")
    public ResponseEntity<List<ReviewResponseDTO>> getDetailedReviews(@PathVariable String sellerId) {
        List<ReviewResponseDTO> reviews = reviewService.getReviewsBySellerDetailed(sellerId);
        return ResponseEntity.ok(reviews);
    }

}
