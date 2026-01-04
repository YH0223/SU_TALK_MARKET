package com.sutalk.backend.domain.chat.controller;

import com.sutalk.backend.domain.chat.dto.ChatRoomRequestDTO;
import com.sutalk.backend.domain.chat.dto.ChatRoomResponseDTO;
import com.sutalk.backend.domain.chat.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat-rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    /** ✅ 거래 기반 채팅방 생성 */
    @PostMapping
    public ResponseEntity<ChatRoomResponseDTO> createChatRoom(@RequestBody ChatRoomRequestDTO request) {
        return ResponseEntity.ok(
                chatRoomService.createChatRoom(
                        request.getItemTransactionId(),
                        request.getBuyerId(),
                        request.getSellerId()
                )
        );
    }

    /** ✅ 유저 기준 전체 채팅방 목록 조회 */
    @GetMapping
    public ResponseEntity<List<ChatRoomResponseDTO>> getChatRoomsByUser(@RequestParam String userId) {
        List<ChatRoomResponseDTO> result = chatRoomService.getChatRoomsByUser(userId);
        return ResponseEntity.ok(result);
    }

    /** ✅ 단일 채팅방 조회 (서비스 위임) */
    @GetMapping("/{chatRoomId}")
    public ResponseEntity<ChatRoomResponseDTO> getChatRoomDtoById(@PathVariable Long chatRoomId) {
        ChatRoomResponseDTO room = chatRoomService.getChatRoomDtoById(chatRoomId);
        return ResponseEntity.ok(room);
    }

    /** ✅ 채팅방 삭제 */
    @DeleteMapping("/{chatRoomId}")
    public ResponseEntity<Void> deleteChatRoom(@PathVariable Long chatRoomId) {
        chatRoomService.deleteChatRoom(chatRoomId);
        return ResponseEntity.noContent().build();
    }

    /** ✅ 친구 간 채팅방 생성 */
    @PostMapping("/friend/create")
    public ResponseEntity<ChatRoomResponseDTO> createOrGetFriendChatRoom(
            @RequestParam String user1,
            @RequestParam String user2
    ) {
        ChatRoomResponseDTO room = chatRoomService.createOrGetFriendChatRoom(user1, user2);
        return ResponseEntity.ok(room);
    }
}
