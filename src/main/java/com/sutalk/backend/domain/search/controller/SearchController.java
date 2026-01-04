package com.sutalk.backend.domain.search.controller;

import com.sutalk.backend.domain.search.dto.ItemSuggestionDTO;
import com.sutalk.backend.domain.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search-history")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    // ✅ 검색 기록 저장
    @PostMapping
    public ResponseEntity<Void> saveKeyword(@RequestBody Map<String, String> body) {
        String keyword = body.get("keyword");
        String userId = body.get("userId");

        if (keyword == null || userId == null || keyword.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        searchService.addSearchHistory(userId, keyword.trim());
        return ResponseEntity.ok().build();
    }

    // ✅ 상품 기반 추천어
    @GetMapping("/suggest")
    public ResponseEntity<List<ItemSuggestionDTO>> getItemSuggestions(@RequestParam String keyword) {
        return ResponseEntity.ok(searchService.getItemSuggestions(keyword));
    }

    // ✅ 검색 기록 조회
    @GetMapping
    public ResponseEntity<List<String>> getSearchHistory(@RequestParam String userId) {
        return ResponseEntity.ok(searchService.getSearchHistory(userId));
    }

    // ✅ 검색 기록 전체 삭제
    @DeleteMapping
    public ResponseEntity<Void> deleteAll(@RequestParam String userId) {
        searchService.deleteAllSearchHistory(userId);
        return ResponseEntity.ok().build();
    }

    // ✅ 특정 검색 기록 삭제
    @DeleteMapping("/{keyword}")
    public ResponseEntity<Void> deleteOne(@RequestParam String userId, @PathVariable String keyword) {
        searchService.deleteSearchHistory(userId, keyword);
        return ResponseEntity.ok().build();
    }
}
