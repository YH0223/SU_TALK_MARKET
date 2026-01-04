package com.sutalk.backend.domain.chat.repository;

import com.sutalk.backend.domain.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /** ✅ 채팅방 메시지 조회 (시간순 정렬) */
    List<ChatMessage> findByChatRoom_ChatroomidOrderBySentAtAsc(Long chatroomid);

    /** ✅ 채팅방 전체 삭제 */
    void deleteByChatRoom_Chatroomid(Long chatroomId);

    void deleteAllByChatRoom_Chatroomid(Long chatroomid);

    /** ✅ 아직 읽지 않은 메시지 목록 */
    List<ChatMessage> findAllByChatRoom_ChatroomidAndSender_UseridNotAndReadFalse(Long chatRoomId, String senderId);

    /** ✅ 읽음 처리 (JPQL 즉시 반영 + 캐시 초기화) */
    @Modifying(clearAutomatically = true)
    @Query("""
        UPDATE ChatMessage m
        SET m.read = true
        WHERE m.chatRoom.chatroomid = :roomId
          AND m.sender.userid <> :readerId
          AND m.read = false
    """)
    int markAllAsRead(@Param("roomId") Long chatRoomId, @Param("readerId") String readerId);
}
