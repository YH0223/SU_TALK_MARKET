package com.sutalk.backend.domain.user.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "sutalk_block")
public class Block {
    

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long blockid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blocker_userid", nullable = false)
    @JsonBackReference
    private User blocker;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blocked_userid", nullable = false)
    private User blocked;
}
