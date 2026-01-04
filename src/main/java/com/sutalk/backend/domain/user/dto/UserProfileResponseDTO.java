package com.sutalk.backend.domain.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserProfileResponseDTO {
    private String userid;
    private String name;
    private String email;
    private double averageRating;
    private int reviewCount;
    private String profileImage;
}
