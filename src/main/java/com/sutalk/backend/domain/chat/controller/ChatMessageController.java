package com.sutalk.backend.domain.chat.controller;

import com.sutalk.backend.domain.chat.dto.MessageResponseDTO;
import com.sutalk.backend.domain.chat.entity.ChatMessage;
import com.sutalk.backend.domain.chat.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat-messages")
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    @GetMapping("/{chatRoomId}")
    public ResponseEntity<List<MessageResponseDTO>> getMessagesByChatRoom(@PathVariable Long chatRoomId) {
        return ResponseEntity.ok(chatMessageService.getMessagesByChatRoom(chatRoomId));
    }
}
