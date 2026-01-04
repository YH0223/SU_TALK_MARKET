package com.sutalk.backend.domain.user.repository;

import com.sutalk.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    // ✅ 이름(name) 업데이트
    @Modifying
    @Query(value = "UPDATE sutalk_user SET name = :newName WHERE userid = :userId", nativeQuery = true)
    void updateName(@Param("userId") String userId, @Param("newName") String newName);

    Optional<User> findByUserid(String userid);

    Optional<User> findByName(String name);

    boolean existsByUserid(String newUserId);



}
