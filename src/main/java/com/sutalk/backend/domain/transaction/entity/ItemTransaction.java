package com.sutalk.backend.domain.transaction.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sutalk.backend.domain.user.entity.User;
import com.sutalk.backend.domain.item.entity.Item;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "sutalk_item_transaction")
public class ItemTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_itemid", nullable = false)
    @JsonIgnore
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_userid", nullable = false)
    private User user;

    @Column(name = "distinct_seller", nullable = false)
    private String distinctSeller;

    @Column(columnDefinition = "TEXT")
    private String comment;
}
