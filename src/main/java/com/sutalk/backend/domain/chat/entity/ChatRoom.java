package com.sutalk.backend.domain.chat.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sutalk.backend.domain.transaction.entity.ItemTransaction;
import com.sutalk.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "sutalk_chat_room")
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long chatroomid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_transactionid", nullable = true)
    @JsonIgnore
    private ItemTransaction itemTransaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_userid", nullable = false)
    @JsonIgnore
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_userid", nullable = false)
    @JsonIgnore
    private User buyer;

    @Column(name = "created_at")
    private Long createdAt;

    @Column(name = "room_type")
    private String roomType; // "TRANSACTION" or "FRIEND"

}
