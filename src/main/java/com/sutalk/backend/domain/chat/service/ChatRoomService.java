package com.sutalk.backend.domain.chat.service;

import com.sutalk.backend.domain.chat.dto.ChatRoomMapper;
import com.sutalk.backend.domain.chat.dto.ChatRoomResponseDTO;
import com.sutalk.backend.domain.chat.entity.ChatRoom;
import com.sutalk.backend.domain.chat.repository.ChatMessageRepository;
import com.sutalk.backend.domain.chat.repository.ChatRoomRepository;
import com.sutalk.backend.domain.item.entity.Item;
import com.sutalk.backend.domain.transaction.entity.ItemTransaction;
import com.sutalk.backend.domain.transaction.repository.ItemTransactionRepository;
import com.sutalk.backend.domain.user.entity.User;
import com.sutalk.backend.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ItemTransactionRepository itemTransactionRepository;
    private final UserRepository userRepository;
    private final ChatRoomMapper chatRoomMapper;

    /**
     * ✅ 거래 기반 채팅방 생성 (거래 없을 시 자동 생성)
     */
    @Transactional
    public ChatRoomResponseDTO createChatRoom(Long transactionId, String buyerId, String sellerId) {
        ItemTransaction transaction;

        if (transactionId != null) {
            transaction = itemTransactionRepository.findById(transactionId)
                    .orElseThrow(() -> new RuntimeException("거래를 찾을 수 없습니다."));
        } else {
            // ✅ 거래 없을 시 새 거래 생성
            User buyer = userRepository.findById(buyerId)
                    .orElseThrow(() -> new RuntimeException("구매자 정보를 찾을 수 없습니다."));
            User seller = userRepository.findById(sellerId)
                    .orElseThrow(() -> new RuntimeException("판매자 정보를 찾을 수 없습니다."));

            // item은 nullable 가능, 혹은 null 처리 (상품 거래 아닐 수도 있음)
            transaction = itemTransactionRepository.save(ItemTransaction.builder()
                    .item(null) // ✅ 필요 시 나중에 채워짐
                    .user(buyer) // ✅ user = 구매자
                    .distinctSeller(seller.getUserid()) // ✅ 판매자 ID 저장
                    .comment(null)
                    .build());
        }

        // ✅ 기존 거래 기반 채팅방 조회 후 없으면 생성
        ChatRoom room = chatRoomRepository
                .findByItemTransaction_Transactionid(transaction.getTransactionid())
                .orElseGet(() -> {
                    User buyer = userRepository.findById(buyerId)
                            .orElseThrow(() -> new RuntimeException("구매자 정보를 찾을 수 없습니다."));
                    User seller = userRepository.findById(sellerId)
                            .orElseThrow(() -> new RuntimeException("판매자 정보를 찾을 수 없습니다."));

                    return chatRoomRepository.save(ChatRoom.builder()
                            .itemTransaction(transaction)
                            .buyer(buyer)
                            .seller(seller)
                            .roomType("TRADE")
                            .createdAt(System.currentTimeMillis())
                            .build());
                });

        return chatRoomMapper.toDto(room);
    }

    /**
     * ✅ 유저의 모든 채팅방 목록 조회
     */
    public List<ChatRoomResponseDTO> getChatRoomsByUser(String userId) {
        List<ChatRoom> rooms = chatRoomRepository.findByBuyer_UseridOrSeller_Userid(userId, userId);

        return rooms.stream()
                .map(room -> {
                    Item item = (room.getItemTransaction() != null) ? room.getItemTransaction().getItem() : null;
                    List<String> itemImages = (item != null && item.getItemImages() != null)
                            ? item.getItemImages().stream().map(i -> i.getPhotoPath()).toList()
                            : List.of();

                    return ChatRoomResponseDTO.builder()
                            .chatroomId(room.getChatroomid())
                            .itemId(item != null ? item.getItemid() : null)
                            .itemTitle(item != null ? item.getTitle() : "상품명 없음")
                            .meetLocation(item != null ? item.getMeetLocation() : null)
                            .itemImages(itemImages)
                            .roomType(room.getRoomType())
                            .buyerId(room.getBuyer() != null ? room.getBuyer().getUserid() : null)
                            .buyerUsername(room.getBuyer() != null ? room.getBuyer().getName() : null)
                            .sellerId(room.getSeller() != null ? room.getSeller().getUserid() : null)
                            .sellerUsername(room.getSeller() != null ? room.getSeller().getName() : null)
                            .createdAt(room.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * ✅ 단일 채팅방 엔티티 조회
     */
    public ChatRoom getChatRoomById(Long chatRoomId) {
        return chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
    }

    /**
     * ✅ 채팅방 삭제
     */
    @Transactional
    public void deleteChatRoom(Long chatRoomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

        chatMessageRepository.deleteAllByChatRoom_Chatroomid(chatRoomId);
        chatRoom.setItemTransaction(null);
        chatRoomRepository.delete(chatRoom);
    }

    /**
     * ✅ 단일 채팅방 DTO 조회
     */
    @Transactional
    public ChatRoomResponseDTO getChatRoomDtoById(Long chatRoomId) {
        ChatRoom room = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방 없음"));

        User buyer = room.getBuyer();
        User seller = room.getSeller();

        String buyerId = (buyer != null) ? buyer.getUserid() : null;
        String buyerName = (buyer != null) ? buyer.getName() : null;
        String sellerId = (seller != null) ? seller.getUserid() : null;
        String sellerName = (seller != null) ? seller.getName() : null;

        Item item = null;
        if (room.getItemTransaction() != null) {
            try {
                item = room.getItemTransaction().getItem();
            } catch (Exception ignored) {}
        }

        Long itemId = (item != null) ? item.getItemid() : null;
        String itemTitle = (item != null && item.getTitle() != null) ? item.getTitle() : "상품명 없음";
        String meetLocation = (item != null) ? item.getMeetLocation() : null;

        List<String> itemImages = (item != null && item.getItemImages() != null)
                ? item.getItemImages().stream().map(img -> img.getPhotoPath()).toList()
                : List.of();

        return ChatRoomResponseDTO.builder()
                .chatroomId(room.getChatroomid())
                .itemId(itemId)
                .itemTitle(itemTitle)
                .meetLocation(meetLocation)
                .itemImages(itemImages)
                .roomType(room.getRoomType())
                .buyerId(buyerId)
                .buyerUsername(buyerName)
                .sellerId(sellerId)
                .sellerUsername(sellerName)
                .createdAt(room.getCreatedAt())
                .build();
    }

    /**
     * ✅ 친구 간 채팅방 생성 또는 반환
     */
    @Transactional
    public ChatRoomResponseDTO createOrGetFriendChatRoom(String user1Id, String user2Id) {
        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new RuntimeException("User not found: " + user1Id));
        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new RuntimeException("User not found: " + user2Id));

        ChatRoom room = chatRoomRepository.findFriendChatRoom(user1Id, user2Id)
                .orElseGet(() -> chatRoomRepository.save(ChatRoom.builder()
                        .buyer(user1)
                        .seller(user2)
                        .roomType("FRIEND")
                        .createdAt(System.currentTimeMillis())
                        .build()));

        return chatRoomMapper.toDto(room);
    }
}
