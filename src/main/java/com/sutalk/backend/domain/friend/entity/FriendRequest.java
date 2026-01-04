package com.sutalk.backend.domain.friend.entity;

import com.sutalk.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table (name = "sutalk_FriendRequest")
public class FriendRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 요청 보낸 유저 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    /** 요청 받은 유저 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    /** 요청 상태 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FriendRequestStatus status = FriendRequestStatus.PENDING;

    /** 생성 시간 */
    @CreationTimestamp
    private LocalDateTime createdAt;
}
