package com.sutalk.backend.domain.community.repository;

import com.sutalk.backend.domain.community.entity.CommunityPost;
import com.sutalk.backend.domain.community.entity.PostCategory;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    // ✅ 댓글까지 함께 로드하면서 최신순 정렬
    @EntityGraph(attributePaths = "comments")
    List<CommunityPost> findAllByOrderByCreatedAtDesc();

    List<CommunityPost> findByCategoryOrderByCreatedAtDesc(PostCategory category);

    List<CommunityPost> findByLikesGreaterThanEqualOrderByCreatedAtDesc(int likes);
}
