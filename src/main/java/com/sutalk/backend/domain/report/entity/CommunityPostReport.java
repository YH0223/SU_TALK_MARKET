package com.sutalk.backend.domain.report.entity;

import com.sutalk.backend.domain.community.entity.CommunityPost;
import com.sutalk.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@DiscriminatorValue("COMMUNITY_POST") // DTYPE 컬럼에 "COMMUNITY_POST"으로 저장
public class CommunityPostReport extends Report {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private CommunityPost communityPost;

    @Builder
    public CommunityPostReport(User reporter, User reported, ReportReason reason, String details, Long regdate, Status status, CommunityPost communityPost) {
        super(reporter, reported, reason, details, regdate, status);
        this.communityPost = communityPost;
    }
}