package com.sutalk.backend.domain.community.controller;

import com.sutalk.backend.domain.community.dto.CommentDTO;
import com.sutalk.backend.domain.community.dto.PostDTO;
import com.sutalk.backend.domain.community.service.CommunityService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @PostMapping(value = "/posts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostDTO.Response> createPost(
            @RequestPart("post") PostDTO.CreateRequest dto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        PostDTO.Response createdPost = communityService.createPostWithImages(dto, images);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }

    @GetMapping("/posts/new")
    public ResponseEntity<List<PostDTO.Response>> getNewPosts() {
        return ResponseEntity.ok(communityService.getNewPosts());
    }

    @GetMapping("/posts/hot")
    public ResponseEntity<List<PostDTO.Response>> getHotPosts() {
        return ResponseEntity.ok(communityService.getHotPosts());
    }

    @GetMapping("/posts/category/{category}")
    public ResponseEntity<List<PostDTO.Response>> getPostsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(communityService.getPostsByCategory(category));
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<PostDTO.DetailResponse> getPost(@PathVariable Long postId) {

        return ResponseEntity.ok(communityService.getPostById(postId));
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long postId,
            @RequestParam String userId
    ) {
        try {
            communityService.deletePost(postId, userId);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            // 게시글이나 사용자를 찾을 수 없는 경우
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            // 권한이 없는 경우
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            // 기타 서버 오류
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ 댓글 작성
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentDTO.Response> addComment(
            @PathVariable Long postId,
            @RequestBody CommentDTO.CreateRequest dto
    ) {
        String authorId = dto.getAuthorId();
        CommentDTO.Response createdComment = communityService.addCommentToPost(postId, dto, authorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestParam String userId
    ) {
        try {
            communityService.deleteComment(commentId, userId);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (EntityNotFoundException e) {
            // 댓글이나 사용자를 찾을 수 없는 경우
            return ResponseEntity.notFound().build(); // 404 Not Found
        } catch (SecurityException e) {
            // 권한이 없는 경우
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 Forbidden
        } catch (Exception e) {
            // 기타 서버 오류
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500
        }
    }



    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<PostDTO.Response> likePost(@PathVariable Long postId,
                                                     @RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        return ResponseEntity.ok(communityService.likePost(postId, userId));

    }

    @GetMapping("/{userId}/likeList")
    public ResponseEntity<List<PostDTO.Response>> getLikedPosts(@PathVariable String userId) {
        return ResponseEntity.ok(communityService.getLikedPostsByUser(userId));
    }
}