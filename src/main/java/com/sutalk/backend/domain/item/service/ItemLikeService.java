package com.sutalk.backend.domain.item.service;

import com.sutalk.backend.domain.item.dto.FavoriteItemDTO;
import com.sutalk.backend.domain.item.entity.Item;
import com.sutalk.backend.domain.item.entity.ItemLike;
import com.sutalk.backend.domain.item.repository.ItemLikeRepository;
import com.sutalk.backend.domain.item.repository.ItemRepository;
import com.sutalk.backend.domain.user.entity.User;
import com.sutalk.backend.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ItemLikeService {

    private final ItemLikeRepository itemLikeRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    // ✅ 좋아요 추가
    public void likeItem(Long itemId, String userId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!itemLikeRepository.existsByItemAndUser(item, user)) {
            ItemLike like = new ItemLike();
            like.setItem(item);
            like.setUser(user);
            itemLikeRepository.save(like);
        }
    }

    // ✅ 좋아요 취소
    public void unlikeItem(Long itemId, String userId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        itemLikeRepository.deleteByItemAndUser(item, user);
    }

    // ✅ 좋아요 개수
    public long countLikes(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
        return itemLikeRepository.countByItem(item);
    }

    // ✅ 유저가 특정 상품을 좋아요 눌렀는지 여부
    public boolean isLiked(Long itemId, String userId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return itemLikeRepository.existsByItemAndUser(item, user);
    }

    // ✅ 유저의 좋아요 상품 목록
    public List<FavoriteItemDTO> getUserFavorites(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<ItemLike> liked = itemLikeRepository.findByUser(user);
        return liked.stream()
                .map(itemLike -> new FavoriteItemDTO(itemLike.getItem()))
                .collect(Collectors.toList());
    }
}
