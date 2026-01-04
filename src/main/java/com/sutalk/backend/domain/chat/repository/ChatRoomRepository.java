package com.sutalk.backend.domain.chat.repository;

import com.sutalk.backend.domain.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    List<ChatRoom> findByBuyer_UseridOrSeller_Userid(String buyerId, String sellerId);
    List<ChatRoom> findAllByItemTransaction_Transactionid(Long transactionId);

    Optional<ChatRoom> findByItemTransaction_Transactionid(Long transactionId);

    void deleteByItemTransaction_Transactionid(Long transactionId); // ✅ 이거 추가!

    // ✅ 두 유저 간 친구 채팅방 존재 여부 확인
    @Query("SELECT r FROM ChatRoom r WHERE " +
            "((r.buyer.userid = :user1 AND r.seller.userid = :user2) OR " +
            "(r.buyer.userid = :user2 AND r.seller.userid = :user1)) " +
            "AND r.itemTransaction IS NULL")
    Optional<ChatRoom> findFriendChatRoom(@Param("user1") String user1, @Param("user2") String user2);

}
