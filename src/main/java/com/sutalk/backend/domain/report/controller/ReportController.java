package com.sutalk.backend.domain.report.controller;

import com.sutalk.backend.domain.report.dto.ReportCreateRequest;
import com.sutalk.backend.domain.report.dto.ReportRequestDTO;
import com.sutalk.backend.domain.report.dto.ReportTargetType;
import com.sutalk.backend.domain.report.entity.ReportReason;
import com.sutalk.backend.domain.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitReport(@RequestBody ReportRequestDTO dto) {
        // ✅ DTO에서 받은 값으로 동적으로 CreateRequest를 생성합니다.
        ReportCreateRequest createRequest = new ReportCreateRequest();
        createRequest.setReporterId(dto.getReporterId());
        createRequest.setTargetType(ReportTargetType.valueOf(dto.getTargetType().toUpperCase()));
        createRequest.setTargetId(dto.getTargetId());
        createRequest.setReason(ReportReason.valueOf(dto.getReason().toUpperCase()));
        createRequest.setDetails(dto.getDetails());

        reportService.submitReport(createRequest);
        return ResponseEntity.ok().build();
    }
}