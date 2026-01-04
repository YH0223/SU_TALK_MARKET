package com.sutalk.backend.domain.item.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sutalk.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.ArrayList;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "sutalk_item")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_userid", referencedColumnName = "userid")
    @JsonIgnore
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_userid", referencedColumnName = "userid")
    @JsonIgnore
    private User buyer;

    @Column(nullable = false)
    private String title;

    @Column(name = "meet_location")
    private String meetLocation;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private int price;

    private String category;

    @Enumerated(EnumType.STRING)
    private Status status = Status.판매중;

    private Long regdate;

    @Column(name = "completed_date")
    private LocalDateTime completedDate;

    private String comment;

    private String thumbnail;

    private String time;

    @Builder.Default
    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<ItemImage> itemImages = new HashSet<>();

    public void addItemImage(ItemImage image) {
        this.itemImages.add(image);
        image.setItem(this);
    }

    /** ✅ Enum 정의 (한글 매핑 메서드 추가) */
    public enum Status {
        판매중, 예약중, 거래완료;

        public static Status fromKorean(String value) {
            if (value == null) throw new IllegalArgumentException("상태값이 null입니다.");
            return switch (value.trim()) {
                case "판매중" -> 판매중;
                case "예약중" -> 예약중;
                case "거래완료" -> 거래완료;
                default -> throw new IllegalArgumentException("유효하지 않은 상태 값: " + value);
            };
        }
    }

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ItemLike> itemLikes = new HashSet<>();

    public void addLike(ItemLike like) {
        this.itemLikes.add(like);
        like.setItem(this);
    }
}
