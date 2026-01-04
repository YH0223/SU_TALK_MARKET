package com.sutalk.backend.domain.friend.repository;

import com.sutalk.backend.domain.friend.entity.FriendRequest;
import com.sutalk.backend.domain.friend.entity.FriendRequestStatus;
import com.sutalk.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    List<FriendRequest> findByReceiverAndStatus(User receiver, FriendRequestStatus status);
    List<FriendRequest> findBySender(User sender);
    boolean existsBySenderAndReceiver(User sender, User receiver);
}
