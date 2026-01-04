package com.sutalk.backend.domain.report.dto;

import com.sutalk.backend.domain.report.entity.ReportReason;
import lombok.Data;

@Data
public class ReportCreateRequest {
    private String reporterId;

    private ReportTargetType targetType; // 신고 대상 타입 (ITEM, POST, COMMENT)
    private Long targetId; // 신고 대상의 ID

    private ReportReason reason; // 신고 사유 Enum
    private String details; // '기타' 사유 상세 내용
}