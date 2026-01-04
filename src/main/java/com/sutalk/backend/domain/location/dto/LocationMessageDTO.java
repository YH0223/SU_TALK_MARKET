package com.sutalk.backend.domain.location.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LocationMessageDTO {
    private String userId;
    private double lat;
    private double lng;
    private String name;
    private String profileImage;
}