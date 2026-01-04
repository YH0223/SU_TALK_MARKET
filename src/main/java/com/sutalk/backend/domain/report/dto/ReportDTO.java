package com.sutalk.backend.domain.report.dto;


import com.sutalk.backend.domain.report.entity.ReportReason;
import lombok.Data;

public class ReportDTO {
    @Data
    public static class CreateRequest {
        private ReportReason reason;
        private String details; // '기타' 사유일 때만 값을 가짐
    }
}