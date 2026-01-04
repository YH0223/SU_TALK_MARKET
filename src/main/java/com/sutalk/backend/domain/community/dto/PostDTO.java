package com.sutalk.backend.domain.community.dto;

import com.sutalk.backend.domain.community.entity.CommunityPost;
import com.sutalk.backend.domain.community.entity.CommunityPostImage;
import com.sutalk.backend.domain.community.entity.PostCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class PostDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private String title;
        private String content;
        private String authorId;
        private String category;
    }

    @Data
    @NoArgsConstructor
    public static class Response {
        private Long id;
        private String title;
        private String content;
        private String author;
        private String authorId;
        private String authorProfileImage;
        private PostCategory category;
        private LocalDateTime createdAt;
        private int likes;
        private int commentsCount;
        private List<String> images;
        private String thumbnailUrl;

        public Response(CommunityPost post) {
            this.id = post.getId();
            this.title = post.getTitle();
            this.content = post.getContent();
            this.author = post.getAuthor().getName();
            this.authorId = post.getAuthor().getUserid();
            this.authorProfileImage =
                    (post.getAuthor() != null && post.getAuthor().getProfileImage() != null)
                            ? post.getAuthor().getProfileImage()
                            : "/uploads/default-profile.png"; // ✅ 프로필 없으면 기본이미지
            this.category = post.getCategory();
            this.createdAt = post.getCreatedAt();
            this.likes = post.getLikes();
            this.commentsCount = post.getComments() != null ? post.getComments().size() : 0;
            this.images = post.getImages().stream()
                    .map(CommunityPostImage::getPhotoPath)
                    .collect(Collectors.toList());
            // ✅ 썸네일 URL 로직 추가 (이미지 리스트의 첫 번째 항목을 사용)
            this.thumbnailUrl = (this.images != null && !this.images.isEmpty())
                    ? this.images.get(0)
                    : null;
        }
    }

    @Data
    @NoArgsConstructor
    public static class DetailResponse {
        private Long id;
        private String title;
        private String content;
        private String author;
        private String authorId;
        private String authorProfileImage; // ✅ 추가
        private PostCategory category;
        private LocalDateTime createdAt;
        private int likes;
        private List<CommentDTO.Response> comments;
        private List<String> images;

        public DetailResponse(CommunityPost post) {
            this.id = post.getId();
            this.title = post.getTitle();
            this.content = post.getContent();
            this.author = post.getAuthor().getName();
            this.authorId = post.getAuthor().getUserid();
            this.authorProfileImage =
                    (post.getAuthor() != null && post.getAuthor().getProfileImage() != null)
                            ? post.getAuthor().getProfileImage()
                            : "/uploads/default-profile.png"; // ✅ 동일 로직
            this.category = post.getCategory();
            this.createdAt = post.getCreatedAt();
            this.likes = post.getLikes();
            this.comments = post.getComments().stream()
                    .map(CommentDTO.Response::new)
                    .collect(Collectors.toList());
            this.images = post.getImages().stream()
                    .map(CommunityPostImage::getPhotoPath)
                    .collect(Collectors.toList());
        }
    }
}
