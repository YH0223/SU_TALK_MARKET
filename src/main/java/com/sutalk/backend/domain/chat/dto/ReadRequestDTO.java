package com.sutalk.backend.domain.chat.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ReadRequestDTO {
    private Long chatRoomId;
    private String readerId;
}
