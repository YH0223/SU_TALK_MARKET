package com.sutalk.backend.domain.chat.controller;

import com.sutalk.backend.domain.chat.dto.MessageDTO;
import com.sutalk.backend.domain.chat.dto.ReadRequestDTO;
import com.sutalk.backend.domain.chat.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatSocketController {

    private final ChatMessageService chatMessageService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageDTO messageDTO) {
        System.out.println("📨 받은 메시지 DTO: " + messageDTO);
        chatMessageService.sendMessage(messageDTO);
        // ⚠️ 여기서 더 이상 messagingTemplate.convertAndSend() 하지 않음
    }

    /* 🟦 읽음 이벤트 추가 */
    @MessageMapping("/chat.read")
    public void markAsRead(@Payload ReadRequestDTO dto) {
        System.out.println("👁️ 읽음 요청 도착: " + dto);
        chatMessageService.markMessagesAsRead(dto.getChatRoomId(), dto.getReaderId());
    }
}
