package com.sutalk.backend.domain.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder // ✅ 추가: 순서 헷갈릴 일 없음
public class ChatRoomResponseDTO {
    private Long chatroomId;

    // 거래 기반일 때만 존재
    private Long itemId;
    private String itemTitle;
    private String meetLocation;
    private List<String> itemImages;

    // 공통 필드
    private String roomType; // "TRANSACTION" or "FRIEND"
    private String buyerId;
    private String buyerUsername;
    private String sellerUsername;
    private String sellerId;
    private Long createdAt;
}
