package com.sutalk.backend.domain.chat.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageDTO {
    private Long chatRoomId;
    private String senderId;
    private String content;

    // ✅ 프론트에서 보낸 고유 식별자(clientId) 추가
    private String clientId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime sentAt;

    private Long messageId;
}
