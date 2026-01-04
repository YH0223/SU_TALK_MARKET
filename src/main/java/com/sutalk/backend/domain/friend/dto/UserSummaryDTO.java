package com.sutalk.backend.domain.friend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * ✅ 친구 목록 등에서 유저 정보를 간단히 전달하기 위한 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDTO {
    private String userid;
    private String name;
    private String profileImage;
}
