package com.sutalk.backend.domain.report.repository;

import com.sutalk.backend.domain.report.entity.Report;
import com.sutalk.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {
    long countByReported(User reported);
}
