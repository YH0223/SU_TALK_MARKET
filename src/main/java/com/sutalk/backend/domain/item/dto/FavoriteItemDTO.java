package com.sutalk.backend.domain.item.dto;

import com.sutalk.backend.domain.item.entity.Item;
import com.sutalk.backend.domain.item.entity.ItemImage;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
public class FavoriteItemDTO {

    private Long itemid;
    private String title;
    private int price;
    private String category;
    private String sellerName;
    private Long likeCount;

    // ✅ 여러 이미지를 담을 배열
    private List<String> itemImages;

    // ✅ 단일 대표 썸네일 (첫 번째 이미지나 thumbnail 필드)
    private String thumbnail;

    public FavoriteItemDTO(Item item) {
        this.itemid = item.getItemid();
        this.title = item.getTitle();
        this.price = item.getPrice();
        this.category = item.getCategory();
        this.sellerName = item.getSeller() != null ? item.getSeller().getName() : "알 수 없음";
        this.likeCount = (long) item.getItemLikes().size();

        // ✅ 전체 이미지 경로 리스트 (상대경로 그대로)
        if (item.getItemImages() != null && !item.getItemImages().isEmpty()) {
            this.itemImages = item.getItemImages().stream()
                    .map(ItemImage::getPhotoPath) // 절대경로 변환 제거
                    .collect(Collectors.toList());
        } else {
            this.itemImages = List.of(); // 비어 있으면 빈 배열
        }

        // ✅ 대표 썸네일 선택 (thumbnail → 첫 번째 이미지)
        if (item.getThumbnail() != null && !item.getThumbnail().isBlank()) {
            this.thumbnail = item.getThumbnail(); // 절대경로 변환 제거
        } else if (!this.itemImages.isEmpty()) {
            this.thumbnail = this.itemImages.get(0);
        } else {
            this.thumbnail = null;
        }
    }
}
