package com.sutalk.backend.domain.chat.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sutalk.backend.domain.chat.dto.MessageDTO;
import com.sutalk.backend.domain.chat.dto.MessageResponseDTO;
import com.sutalk.backend.domain.chat.entity.ChatMessage;
import com.sutalk.backend.domain.chat.entity.ChatRoom;
import com.sutalk.backend.domain.user.entity.User;
import com.sutalk.backend.domain.chat.repository.ChatMessageRepository;
import com.sutalk.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomService chatRoomService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /** ✅ 메시지 전송 */
    public void sendMessage(MessageDTO dto) {
        ChatRoom chatRoom = chatRoomService.getChatRoomById(dto.getChatRoomId());
        User sender = userRepository.findById(dto.getSenderId())
                .orElseThrow(() -> new RuntimeException("보낸 사람을 찾을 수 없습니다."));

        LocalDateTime now = LocalDateTime.now();

        ChatMessage message = ChatMessage.builder()
                .chatRoom(chatRoom)
                .sender(sender)
                .content(dto.getContent())
                .clientId(dto.getClientId())
                .sentAt(now)
                .read(false)
                .build();

        ChatMessage saved = chatMessageRepository.save(message);

        // ✅ 클라이언트로 전송
        MessageDTO responseDTO = new MessageDTO();
        responseDTO.setMessageId(saved.getMessageid());
        responseDTO.setChatRoomId(saved.getChatRoom().getChatroomid());
        responseDTO.setSenderId(saved.getSender().getUserid());
        responseDTO.setContent(saved.getContent());
        responseDTO.setClientId(saved.getClientId());
        responseDTO.setSentAt(now);

        System.out.println("📡 [Broadcast] /topic/chat/" + dto.getChatRoomId() + " => " + responseDTO);
        messagingTemplate.convertAndSend("/topic/chat/" + dto.getChatRoomId(), responseDTO);
    }

    /** ✅ 채팅방 메시지 조회 */
    public List<MessageResponseDTO> getMessagesByChatRoom(Long chatRoomId) {
        return chatMessageRepository.findByChatRoom_ChatroomidOrderBySentAtAsc(chatRoomId)
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    private MessageResponseDTO toResponseDto(ChatMessage msg) {
        return MessageResponseDTO.builder()
                .messageId(msg.getMessageid())
                .chatRoomId(msg.getChatRoom().getChatroomid())
                .senderId(msg.getSender().getUserid())
                .content(msg.getContent())
                .sentAt(msg.getSentAt())
                .isRead(msg.isRead())
                .build();
    }

    /** ✅ 읽음 처리 (DB 즉시 반영 + 브로드캐스트) */
    @Transactional
    public void markMessagesAsRead(Long chatRoomId, String readerId) {
        // ✅ JPQL로 즉시 반영 (flush 불필요)
        int updatedCount = chatMessageRepository.markAllAsRead(chatRoomId, readerId);
        System.out.println("👁️ 읽음 처리된 메시지 수: " + updatedCount);

        // ✅ 업데이트된 메시지 ID 재조회 (이제 DB에서 true로 반영됨)
        List<Long> readMessageIds = chatMessageRepository
                .findByChatRoom_ChatroomidOrderBySentAtAsc(chatRoomId)
                .stream()
                .filter(m -> m.isRead() && !m.getSender().getUserid().equals(readerId))
                .map(ChatMessage::getMessageid)
                .toList();

        try {
            String jsonPayload = new ObjectMapper().writeValueAsString(readMessageIds);
            messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId + "/read", jsonPayload);
            System.out.println("👁️ 읽음 브로드캐스트 전송: " + jsonPayload);
        } catch (Exception e) {
            System.err.println("❌ 읽음 브로드캐스트 변환 실패: " + e.getMessage());
        }
    }
}
