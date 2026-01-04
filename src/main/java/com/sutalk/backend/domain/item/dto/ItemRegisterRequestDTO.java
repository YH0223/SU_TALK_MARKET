package com.sutalk.backend.domain.item.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class ItemRegisterRequestDTO {
    private String title;
    private String description;
    private Integer price;
    private String category;
    private String sellerId;  // 🔧 사용자 ID 문자열
    private List<String> itemImages;
    private String meetLocation;
}
