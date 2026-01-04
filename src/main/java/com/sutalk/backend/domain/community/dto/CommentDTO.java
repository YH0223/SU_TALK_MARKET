package com.sutalk.backend.domain.community.dto;

import com.sutalk.backend.domain.community.entity.Comment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class CommentDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private String content;
        private String authorId;
    }

    @Data
    @NoArgsConstructor
    public static class Response {
        private Long id;
        private String content;
        private String authorId;
        private String author;
        private String authorProfileImage; // ✅ 추가된 필드
        private LocalDateTime createdAt;

        public Response(Comment comment) {
            this.id = comment.getId();
            this.content = comment.getContent();
            this.authorId = comment.getAuthor().getUserid();
            this.author = comment.getAuthor().getName();
            this.authorProfileImage =
                    (comment.getAuthor() != null && comment.getAuthor().getProfileImage() != null)
                            ? comment.getAuthor().getProfileImage()
                            : "/uploads/default-profile.png"; // ✅ 기본 이미지 경로
            this.createdAt = comment.getCreatedAt();
        }
    }
}
