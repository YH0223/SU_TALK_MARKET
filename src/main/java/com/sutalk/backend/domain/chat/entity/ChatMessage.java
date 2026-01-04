package com.sutalk.backend.domain.chat.entity;

import com.sutalk.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "sutalk_chat_message")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long messageid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chatroomid", nullable = false)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_userid", nullable = false)
    private User sender;

    @Column(name = "message_content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "is_read")
    private boolean read;  // ✅ boolean + read → Lombok 자동으로 isRead() 생성

    @Column(name = "client_id")
    private String clientId;
}
