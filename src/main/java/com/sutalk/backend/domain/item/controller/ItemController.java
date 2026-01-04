package com.sutalk.backend.domain.item.controller;

import com.sutalk.backend.domain.item.dto.ItemRegisterRequestDTO;
import com.sutalk.backend.domain.item.dto.ItemResponseDTO;
import com.sutalk.backend.domain.search.dto.ItemSuggestionDTO;
import com.sutalk.backend.domain.chat.repository.ChatRoomRepository;
import com.sutalk.backend.domain.item.repository.ItemRepository;
import com.sutalk.backend.domain.item.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;
    private final ItemRepository itemRepository;
    private final ChatRoomRepository chatRoomRepository;

    /** ✅ 상품 등록 (멀티파트 처리) */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> registerItem(
            @RequestPart("item") ItemRegisterRequestDTO requestDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        Long itemId = itemService.saveItemWithImages(requestDTO, images);
        Map<String, Object> response = new HashMap<>();
        response.put("itemid", itemId);
        response.put("message", "상품이 성공적으로 등록되었습니다.");
        return ResponseEntity.ok(response);
    }

    /** ✅ 단일 게시글 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<ItemResponseDTO> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemResponseById(id));
    }

    /** ✅ 전체 게시글 조회 */
    @GetMapping
    public ResponseEntity<List<ItemResponseDTO>> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    /** ✅ 내 판매 내역 */
    @GetMapping("/mine")
    public ResponseEntity<List<ItemResponseDTO>> getMyItems(@RequestParam String userId) {
        return ResponseEntity.ok(itemService.getItemsBySellerId(userId));
    }

    /** ✅ 기존 이미지 유지 + 신규 이미지 추가 가능하도록 수정 */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> updateItem(
            @PathVariable Long id,
            @RequestPart("item") ItemRegisterRequestDTO requestDTO,
            @RequestParam(value = "existingImages", required = false) List<String> existingImages, // ✅ 핵심 수정
            @RequestPart(value = "images", required = false) List<MultipartFile> newImages
    ) {
        itemService.updateItem(id, requestDTO, existingImages, newImages);
        Map<String, Object> response = new HashMap<>();
        response.put("itemid", id);
        response.put("message", "게시글이 성공적으로 수정되었습니다.");
        return ResponseEntity.ok(response);
    }

    /** ✅ 게시글 삭제 */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "게시글이 삭제되었습니다.");
        return ResponseEntity.ok(response);
    }

    /** ✅ 예약중/거래완료 등 상태 변경 */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateItemStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String status = body.get("status");
        itemService.updateItemStatus(id, status);
        Map<String, String> response = new HashMap<>();
        response.put("message", "게시글 상태가 성공적으로 변경되었습니다.");
        return ResponseEntity.ok(response);
    }

    /** ✅ 거래 완료 처리 */
    @PostMapping("/{itemId}/complete")
    public ResponseEntity<String> completeItemDeal(
            @PathVariable Long itemId,
            @RequestParam Long chatRoomId
    ) {
        itemService.completeItemDeal(itemId, chatRoomId);
        return ResponseEntity.ok("거래 완료 처리되었습니다.");
    }

    /** ✅ 구매자 거래완료 목록 */
    @GetMapping("/completed")
    public ResponseEntity<List<ItemResponseDTO>> getCompletedItemsByBuyer(@RequestParam String userId) {
        return ResponseEntity.ok(itemService.getCompletedItemsByBuyer(userId));
    }

    /** ✅ 추천 검색 */
    @GetMapping("/suggest")
    public ResponseEntity<List<ItemSuggestionDTO>> getSuggestions(@RequestParam String keyword) {
         return ResponseEntity.ok(itemService.getItemSuggestionsWithImage(keyword));
    }

    /** ✅ 판매자 ID로 조회 */
    @GetMapping("/by-seller")
    public ResponseEntity<List<ItemResponseDTO>> getItemsBySeller(@RequestParam String sellerId) {
        return ResponseEntity.ok(itemService.getItemsBySeller(sellerId));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalStateException(IllegalStateException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

}
