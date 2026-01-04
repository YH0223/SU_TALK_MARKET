package com.sutalk.backend.domain.community.repository;

import com.sutalk.backend.domain.community.entity.CommunityPostImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityPostImageRepository extends JpaRepository<CommunityPostImage, Long> {
}