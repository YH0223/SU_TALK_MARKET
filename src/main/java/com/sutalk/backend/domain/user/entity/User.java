package com.sutalk.backend.domain.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sutalk.backend.domain.chat.entity.ChatMessage;
import com.sutalk.backend.domain.report.entity.Report;
import com.sutalk.backend.domain.item.entity.Item;
import com.sutalk.backend.domain.transaction.entity.ItemTransaction;
import jakarta.persistence.*;
import lombok.*;


import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "sutalk_user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @Column(name = "userid", length = 255)
    private String userid;

    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    private String status;

    private String password;

    // ✅ 새로 추가된 필드 (프로필 이미지 경로)
    @Column(name = "profile_image")
    private String profileImage;

    // 연관 관계
    @OneToMany(mappedBy = "seller", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Item> sellingItems = new HashSet<>();

    @OneToMany(mappedBy = "buyer", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Item> buyingItems = new HashSet<>();

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<ItemTransaction> transactions;

    @OneToMany(mappedBy = "reporter", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Report> reportsSent = new HashSet<>();

    @OneToMany(mappedBy = "reported", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Report> reportsReceived = new HashSet<>();

    @OneToMany(mappedBy = "blocker", fetch = FetchType.LAZY)
    private List<Block> blockedUsers;

    @OneToMany(mappedBy = "blocked", fetch = FetchType.LAZY)
    private List<Block> blockingUsers;

    @OneToMany(mappedBy = "sender")
    @JsonIgnore
    private List<ChatMessage> sentMessages;
}
