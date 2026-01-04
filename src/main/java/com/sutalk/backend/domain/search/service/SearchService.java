package com.sutalk.backend.domain.search.service;

import com.sutalk.backend.domain.search.dto.ItemSuggestionDTO;
import com.sutalk.backend.domain.history.entity.History;
import com.sutalk.backend.domain.user.entity.User;
import com.sutalk.backend.domain.item.repository.ItemRepository;
import com.sutalk.backend.domain.search.repository.SearchHistoryRepository;
import com.sutalk.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SearchService {

    private final SearchHistoryRepository searchHistoryRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;

    // ✅ 상품 기반 추천어
    public List<ItemSuggestionDTO> getItemSuggestions(String keyword) {
        return itemRepository.findTop10ByKeyword(keyword).stream()
                .map(item -> new ItemSuggestionDTO(
                        item.getItemid(),
                        item.getTitle(),
                        (item.getItemImages() == null || item.getItemImages().isEmpty())
                                ? "/default-image.png"
                                : item.getItemImages().iterator().next().getPhotoPath()
                ))
                .collect(Collectors.toList());
    }

    // ✅ 검색 기록 조회
    public List<String> getSearchHistory(String userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return searchHistoryRepository.findAllByUserOrderBySearchAtDesc(user)
                .stream()
                .map(History::getKeyword)
                .collect(Collectors.toList());
    }

    // ✅ 검색 기록 추가
    @Transactional
    public void addSearchHistory(String userId, String keyword) {
        User user = userRepository.findById(userId).orElseThrow();
        searchHistoryRepository.deleteByUserAndKeyword(user, keyword);
        History history = History.builder()
                .user(user)
                .keyword(keyword)
                .searchAt(LocalDateTime.now())
                .build();
        searchHistoryRepository.save(history);
    }

    // ✅ 검색 기록 삭제
    @Transactional
    public void deleteSearchHistory(String userId, String keyword) {
        User user = userRepository.findById(userId).orElseThrow();
        searchHistoryRepository.deleteByUserAndKeyword(user, keyword);
    }

    // ✅ 전체 검색 기록 삭제
    @Transactional
    public void deleteAllSearchHistory(String userId) {
        User user = userRepository.findById(userId).orElseThrow();
        searchHistoryRepository.deleteAllByUser(user);
    }
}
