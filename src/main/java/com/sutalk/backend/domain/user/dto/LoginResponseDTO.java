package com.sutalk.backend.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LoginResponseDTO {
    private String userId;
    private String name;      //sutalk_user에서 name가져오기
    private String accessToken;
}
