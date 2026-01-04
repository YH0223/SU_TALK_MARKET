package com.sutalk.backend.domain.report.dto;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class ReportRequestDTO {
    private String reporterId;
    private String targetType; // ✅ 신고 타입(POST, COMMENT, ITEM 등)
    private Long targetId;     // ✅ 신고 대상 ID (게시글, 댓글, 아이템 ID)
    private String reason;
    private String details;    // ✅ '기타' 사유
}