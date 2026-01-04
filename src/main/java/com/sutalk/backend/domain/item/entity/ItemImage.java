package com.sutalk.backend.domain.item.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "sutalk_item_images")
public class ItemImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long photoid;

    @Column(name = "photo_path")
    private String photoPath;

    private LocalDateTime regdate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_itemid")
    private Item item;
}
