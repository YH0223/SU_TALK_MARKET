package com.sutalk.backend.domain.transaction.service;

import com.sutalk.backend.domain.item.entity.Item;
import com.sutalk.backend.domain.transaction.entity.ItemTransaction;
import com.sutalk.backend.domain.user.entity.User;
import com.sutalk.backend.domain.item.repository.ItemRepository;
import com.sutalk.backend.domain.transaction.repository.ItemTransactionRepository;
import com.sutalk.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ItemTransactionService {

    private final ItemTransactionRepository itemTransactionRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    public ItemTransaction createTransaction(String buyerId, String sellerId, Long itemId) {
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("구매자 정보가 없습니다."));
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("판매자 정보가 없습니다."));
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("상품 정보를 찾을 수 없습니다."));

        ItemTransaction transaction = ItemTransaction.builder()
                .item(item)
                .user(buyer) // 구매자
                .distinctSeller(seller.getUserid()) // 판매자 ID 문자열
                .comment("")
                .build();

        return itemTransactionRepository.save(transaction);
    }
}
