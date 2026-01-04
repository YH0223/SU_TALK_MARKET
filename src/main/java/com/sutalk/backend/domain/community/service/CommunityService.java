package com.sutalk.backend.domain.community.service;

import com.sutalk.backend.domain.community.entity.Comment;
import com.sutalk.backend.domain.community.entity.CommunityPost;
import com.sutalk.backend.domain.community.dto.CommentDTO;
import com.sutalk.backend.domain.community.dto.PostDTO;
import com.sutalk.backend.domain.community.entity.CommunityPostImage;
import com.sutalk.backend.domain.community.entity.PostCategory;
import com.sutalk.backend.domain.community.repository.CommunityPostImageRepository;
import com.sutalk.backend.domain.community.entity.CommunityPostLike;
import com.sutalk.backend.domain.community.repository.CommunityPostLikeRepository;
import com.sutalk.backend.domain.user.entity.User;
import com.sutalk.backend.domain.community.repository.CommentRepository;
import com.sutalk.backend.domain.community.repository.CommunityPostRepository;
import com.sutalk.backend.domain.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommunityService {

    private final CommunityPostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final CommunityPostLikeRepository postLikeRepository;

    private final CommunityPostImageRepository postImageRepository; // ✅ ADD: 이미지 리포지토리 주입
    // ✅ ADD: ItemService에서 파일 저장 경로 로직 가져옴
    private final Path UPLOAD_ROOT = Paths.get(System.getProperty("user.dir"), "uploads").toAbsolutePath();

    @Transactional
    public PostDTO.Response createPostWithImages(PostDTO.CreateRequest dto, List<MultipartFile> images) {
        User author = userRepository.findById(dto.getAuthorId())
                .orElseThrow(() -> new RuntimeException("작성자를 찾을 수 없습니다."));

        CommunityPost newPost = new CommunityPost();
        newPost.setTitle(dto.getTitle());
        newPost.setContent(dto.getContent());
        newPost.setAuthor(author); // ✅ String 대신 User 객체를 설정
        newPost.setCategory(PostCategory.valueOf(dto.getCategory())); // ✅ 카테고리 설정

        savePostImages(images, newPost);
        CommunityPost savedPost = postRepository.save(newPost);
        return new PostDTO.Response(savedPost);
    }

    public List<PostDTO.Response> getNewPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(PostDTO.Response::new)
                .collect(Collectors.toList());
    }

    public List<PostDTO.Response> getHotPosts() {
        return postRepository.findByLikesGreaterThanEqualOrderByCreatedAtDesc(1).stream()
                .map(PostDTO.Response::new)
                .collect(Collectors.toList());
    }

    public List<PostDTO.Response> getPostsByCategory(String category) {
        PostCategory postCategory = PostCategory.valueOf(category.toUpperCase());
        return postRepository.findByCategoryOrderByCreatedAtDesc(postCategory).stream()
                .map(PostDTO.Response::new)
                .collect(Collectors.toList());
    }

    public PostDTO.DetailResponse getPostById(Long postId) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 없습니다. id=" + postId));
        return new PostDTO.DetailResponse(post);
    }

    @Transactional
    public void deletePost(Long postId, String userId) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("게시글을 찾을 수 없습니다. id=" + postId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. id=" + userId));

        if (!post.getAuthor().equals(user)) {
            throw new SecurityException("삭제 권한이 없습니다.");
        }

        postRepository.delete(post);
    }


    @Transactional
    public CommentDTO.Response addCommentToPost(Long postId, CommentDTO.CreateRequest dto, String authorId) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("작성자를 찾을 수 없습니다."));
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 없습니다."));

        Comment newComment = new Comment();
        newComment.setContent(dto.getContent());
        newComment.setAuthor(author); // ✅ String 대신 User 객체를 설정
        newComment.setPost(post);

        Comment savedComment = commentRepository.save(newComment);
        return new CommentDTO.Response(savedComment);
    }

    @Transactional
    public void deleteComment(Long commentId, String userId) {
        // 1. 댓글 조회
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("댓글을 찾을 수 없습니다. id=" + commentId));

        // 2. 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. id=" + userId));

        // 3. 권한 확인 (댓글 작성자와 요청자가 동일한지)
        if (!comment.getAuthor().equals(user)) {
            throw new SecurityException("댓글 삭제 권한이 없습니다.");
        }

        // 4. 댓글 삭제
        commentRepository.delete(comment);
    }


    // 게시글 좋아요 처리
    @Transactional
    public PostDTO.Response likePost(Long postId,String userId) {
        System.out.println(userId);
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자가 없습니다."));

        boolean alreadyLiked = postLikeRepository.existsByUserAndPost(user, post);

        if (alreadyLiked) {
            postLikeRepository.deleteByUserAndPost(user, post);
            post.setLikes(post.getLikes() - 1);
        } else {
            postLikeRepository.save(new CommunityPostLike(null, post, user));
            post.setLikes(post.getLikes() + 1);
        }

        postRepository.save(post);
        return new PostDTO.Response(post);
    }

    @Transactional
    public List<PostDTO.Response> getLikedPostsByUser(String userId) {
        List<CommunityPostLike> likes = postLikeRepository.findByUser_Userid(userId);

        return likes.stream()
                .map(CommunityPostLike::getPost)
                .map(PostDTO.Response::new) // 👈 생성자 사용
                .collect(Collectors.toList());
    }


    // ✅ ADD: ItemService에서 가져온 이미지 저장 메소드 (CommunityPost에 맞게 수정)
    private void savePostImages(List<MultipartFile> images, CommunityPost post) {
        if (images == null || images.isEmpty()) return;
        ensureUploadsDirExists();

        for (MultipartFile file : images) {
            try {
                String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
                String base = UUID.randomUUID().toString().replace("-", "");
                String filename = (ext == null || ext.isBlank()) ? base : base + "." + ext.toLowerCase();

                Path originPath = UPLOAD_ROOT.resolve(filename);
                Files.copy(file.getInputStream(), originPath, StandardCopyOption.REPLACE_EXISTING);

                CommunityPostImage image = CommunityPostImage.builder()
                        .photoPath("/uploads/" + filename)
                        .build();

                post.addImage(image);

            } catch (IOException e) {
                throw new RuntimeException("이미지 저장 실패: " + e.getMessage(), e);
            }
        }
    }

    // ✅ ADD: uploads 디렉토리 존재 확인 및 생성
    private void ensureUploadsDirExists() {
        try {
            Files.createDirectories(UPLOAD_ROOT);
        } catch (IOException e) {
            throw new RuntimeException("업로드 디렉토리 생성 실패: " + e.getMessage(), e);
        }
    }


}