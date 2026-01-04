package com.sutalk.backend.domain.community.repository;

import com.sutalk.backend.domain.community.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    long countByPost_Id(Long postId);}
