package com.sutalk.backend.domain.chat.dto;

import com.sutalk.backend.domain.chat.entity.ChatRoom;
import com.sutalk.backend.domain.item.entity.Item;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class ChatRoomMapper {

    public ChatRoomResponseDTO toDto(ChatRoom room) {
        Long itemId = null;
        String itemTitle = null;
        String meetLocation = null;
        List<String> itemImages = Collections.emptyList();

        if (room.getItemTransaction() != null && room.getItemTransaction().getItem() != null) {
            Item item = room.getItemTransaction().getItem();
            itemId = item.getItemid();
            itemTitle = item.getTitle();
            meetLocation = item.getMeetLocation();
            itemImages = item.getItemImages().stream()
                    .map(img -> img.getPhotoPath())
                    .toList();
        }

        return ChatRoomResponseDTO.builder()
                .chatroomId(room.getChatroomid())
                .itemId(itemId)
                .itemTitle(itemTitle)
                .meetLocation(meetLocation)
                .itemImages(itemImages)
                .roomType(room.getRoomType()) // FRIEND / TRANSACTION (null 가능)
                .buyerId(room.getBuyer().getUserid())
                .buyerUsername(room.getBuyer().getName())
                .sellerId(room.getSeller().getUserid())
                .sellerUsername(room.getSeller().getName())
                .createdAt(room.getCreatedAt())
                .build();
    }
}
