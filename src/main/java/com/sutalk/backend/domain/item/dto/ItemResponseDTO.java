package com.sutalk.backend.domain.item.dto;

import com.sutalk.backend.domain.item.entity.Item;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemResponseDTO {
    private Long itemid;
    private String title;
    private String category;
    private String description;
    private int price;
    private String regdate;
    private String meetLocation;
    private String sellerId;
    private String sellerName;
    private String sellerProfileImage; // ✅ 추가된 필드
    private List<String> itemImages;
    private String status;

    public static ItemResponseDTO from(Item item) {
        // ✅ 1️⃣ 판매자 정보 안전하게 처리 (NullPointer 방지)
        String sellerId = null;
        String sellerName = null;
        String sellerProfileImage = "/uploads/default-profile.png"; // ✅ 기본 프로필 이미지 경로

        if (item.getSeller() != null) {
            sellerId = item.getSeller().getUserid();
            sellerName = item.getSeller().getName();

            String rawImage = item.getSeller().getProfileImage();
            if (rawImage != null && !rawImage.trim().isEmpty()) {
                // ✅ 실제 프로필 이미지가 존재할 경우만 교체
                sellerProfileImage = rawImage;
            }
        }

        // ✅ 2️⃣ 게시글 이미지 목록 처리 (NullPointer 방지)
        List<String> imagePaths = item.getItemImages() != null
                ? item.getItemImages().stream()
                .map(image -> image.getPhotoPath())
                .collect(Collectors.toList())
                : List.of(); // null일 경우 빈 리스트 반환

        // ✅ 3️⃣ DTO 반환 (기존 구조 유지)
        return ItemResponseDTO.builder()
                .itemid(item.getItemid())
                .title(item.getTitle())
                .category(item.getCategory())
                .description(item.getDescription())
                .price(item.getPrice())
                .regdate(String.valueOf(item.getRegdate()))
                .meetLocation(item.getMeetLocation())
                .sellerId(sellerId)
                .sellerName(sellerName)
                .sellerProfileImage(sellerProfileImage)
                .itemImages(imagePaths)
                .status(String.valueOf(item.getStatus()))
                .build();
    }
}
