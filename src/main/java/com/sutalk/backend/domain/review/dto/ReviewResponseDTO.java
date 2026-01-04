// ReviewResponseDTO.java
package com.sutalk.backend.domain.review.dto;

import com.sutalk.backend.domain.review.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class ReviewResponseDTO {
    private int rating;
    private String comment;
    private String reviewerNickname;
    private String reviewerUserid; // ✅ 추가
    private LocalDateTime createdAt;
    private String itemTitle; // ← 추가

    public static ReviewResponseDTO fromEntity(Review review) {
        return ReviewResponseDTO.builder()
                .rating(review.getRating())
                .comment(review.getComment())
                .reviewerNickname(review.getReviewer().getName())
                .reviewerUserid(review.getReviewer().getUserid()) // ✅ 추가
                .itemTitle(review.getItem().getTitle()) // ← 추가
                .createdAt(review.getCreatedAt())
                .build();
    }
}
