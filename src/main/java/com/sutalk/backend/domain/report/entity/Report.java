package com.sutalk.backend.domain.report.entity;

import com.sutalk.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "sutalk_report")
// ✅ 1. 상속 관계 매핑 설정 (단일 테이블 전략)
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
// ✅ 2. 타입을 구분할 컬럼 설정 (기본값: DTYPE)
@DiscriminatorColumn(name = "report_type")
// ✅ 3. 추상 클래스로 변경
public abstract class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_userid", referencedColumnName = "userid", nullable = false)
    private User reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_userid", referencedColumnName = "userid", nullable = false)
    private User reported;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportReason reason;

    @Column(columnDefinition = "TEXT")
    private String details;

    private Long regdate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    public enum Status {
        접수, 처리중, 완료
    }

    // Builder 등을 위해 생성자 추가
    public Report(User reporter, User reported, ReportReason reason, String details, Long regdate, Status status) {
        this.reporter = reporter;
        this.reported = reported;
        this.reason = reason;
        this.details = details;
        this.regdate = regdate;
        this.status = status;
    }
}