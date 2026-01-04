package com.sutalk.backend.domain.chat.dto;

import lombok.Data;

@Data
public class ChatRoomRequestDTO {
    private Long itemTransactionId;
    private String buyerId;
    private String sellerId;
}
