package com.sutalk.backend.domain.report.entity;

import com.sutalk.backend.domain.community.entity.Comment;
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
@DiscriminatorValue("COMMENT") // DTYPE 컬럼에 "COMMENT"으로 저장
public class CommentReport extends Report {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id")
    private Comment comment;

    @Builder
    public CommentReport(User reporter, User reported, ReportReason reason, String details, Long regdate, Status status, Comment comment) {
        super(reporter, reported, reason, details, regdate, status); // super() 호출 수정
        this.comment = comment;
    }
}