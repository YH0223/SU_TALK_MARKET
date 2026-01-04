package com.sutalk.backend.domain.community.entity;

import com.sutalk.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "sutalk_community_post")
public class CommunityPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostCategory category;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", referencedColumnName = "userid", nullable = false)
    private User author;  // ✅ 반드시 User 타입

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private int likes = 0;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt DESC")
    private List<Comment> comments = new ArrayList<>();


    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommunityPostImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CommunityPostLike> likesSet = new HashSet<>();

    public void addImage(CommunityPostImage image) {
        this.images.add(image);
        image.setPost(this);
    }
}


