package com.sutalk.backend.domain.report.service;

import com.sutalk.backend.domain.report.dto.ReportCreateRequest; // ✅ 수정된 import
import com.sutalk.backend.domain.community.entity.Comment;
import com.sutalk.backend.domain.community.entity.CommunityPost;
import com.sutalk.backend.domain.community.repository.CommentRepository;
import com.sutalk.backend.domain.community.repository.CommunityPostRepository;
import com.sutalk.backend.domain.item.entity.Item;
import com.sutalk.backend.domain.item.repository.ItemRepository;
import com.sutalk.backend.domain.report.entity.CommentReport;
import com.sutalk.backend.domain.report.entity.CommunityPostReport;
import com.sutalk.backend.domain.report.entity.ItemReport;
import com.sutalk.backend.domain.report.entity.Report;
import com.sutalk.backend.domain.report.repository.ReportRepository;
import com.sutalk.backend.domain.user.entity.User;
import com.sutalk.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final CommunityPostRepository postRepository;
    private final CommentRepository commentRepository;

    @Transactional
    public void submitReport(ReportCreateRequest dto) {
        User reporter = userRepository.findById(dto.getReporterId())
                .orElseThrow(() -> new RuntimeException("신고자를 찾을 수 없습니다."));

        Report report;
        User reported;

        switch (dto.getTargetType()) {
            case ITEM:
                Item item = itemRepository.findById(dto.getTargetId())
                        .orElseThrow(() -> new RuntimeException("신고할 아이템을 찾을 수 없습니다."));
                reported = item.getSeller();

                report = ItemReport.builder()
                        .item(item)
                        .build();
                break;

            case POST:
                CommunityPost post = postRepository.findById(dto.getTargetId())
                        .orElseThrow(() -> new RuntimeException("신고할 게시글을 찾을 수 없습니다."));
                reported = post.getAuthor();

                report = CommunityPostReport.builder()
                        .communityPost(post)
                        .build();
                break;

            case COMMENT:
                Comment comment = commentRepository.findById(dto.getTargetId())
                        .orElseThrow(() -> new RuntimeException("신고할 댓글을 찾을 수 없습니다."));
                reported = comment.getAuthor();

                report = CommentReport.builder()
                        .comment(comment)
                        .build();
                break;

            default:
                throw new IllegalArgumentException("유효하지 않은 신고 타입입니다.");
        }

        report.setReporter(reporter);
        report.setReported(reported);
        report.setReason(dto.getReason());
        report.setDetails(dto.getDetails());
        report.setRegdate(System.currentTimeMillis());
        report.setStatus(Report.Status.접수);

        reportRepository.save(report);

        long count = reportRepository.countByReported(reported);
        if (count >= 3) {
            // TODO: 사용자 상태 변경 등 징계 처리 로직
        }
    }
}
