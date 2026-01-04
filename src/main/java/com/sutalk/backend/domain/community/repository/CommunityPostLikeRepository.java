package com.sutalk.backend.domain.community.repository;

import com.sutalk.backend.domain.community.entity.CommunityPost;
import com.sutalk.backend.domain.community.entity.CommunityPostLike;
import com.sutalk.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityPostLikeRepository extends JpaRepository<CommunityPostLike, Long> {
    boolean existsByUserAndPost(User user, CommunityPost post);
    void deleteByUserAndPost(User user, CommunityPost post);
    long countByPost(CommunityPost post);
    List<CommunityPostLike> findByUser_Userid(String userId);
}
