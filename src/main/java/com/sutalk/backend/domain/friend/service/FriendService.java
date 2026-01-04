package com.sutalk.backend.domain.friend.service;

import com.sutalk.backend.domain.friend.dto.UserSummaryDTO;
import com.sutalk.backend.domain.friend.entity.FriendRequest;
import com.sutalk.backend.domain.friend.entity.FriendRequestStatus;
import com.sutalk.backend.domain.friend.entity.Friendship;
import com.sutalk.backend.domain.friend.repository.FriendRequestRepository;
import com.sutalk.backend.domain.friend.repository.FriendshipRepository;
import com.sutalk.backend.domain.user.entity.User;
import com.sutalk.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendRequestRepository friendRequestRepository;
    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    /** ✅ 친구 요청 보내기 */
    @Transactional
    public void sendRequest(String senderId, String receiverId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("보내는 유저 없음"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("받는 유저 없음"));

        if (friendRequestRepository.existsBySenderAndReceiver(sender, receiver))
            throw new RuntimeException("이미 요청 중입니다.");

        friendRequestRepository.save(FriendRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .status(FriendRequestStatus.PENDING)
                .build());
    }

    /** ✅ 친구 요청 수락 */
    @Transactional
    public void acceptRequest(Long requestId) {
        FriendRequest req = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("요청 없음"));

        if (req.getStatus() != FriendRequestStatus.PENDING)
            throw new RuntimeException("이미 처리된 요청입니다.");

        req.setStatus(FriendRequestStatus.ACCEPTED);

        User sender = req.getSender();
        User receiver = req.getReceiver();

        boolean exists = friendshipRepository.existsByUser1AndUser2(sender, receiver)
                || friendshipRepository.existsByUser1AndUser2(receiver, sender);

        if (!exists) {
            friendshipRepository.save(Friendship.builder()
                    .user1(sender)
                    .user2(receiver)
                    .build());
        }
    }

    /** ✅ 친구 목록 조회 (DTO 반환) */
    @Transactional(readOnly = true)
    public List<UserSummaryDTO> getFriends(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        List<Friendship> relations = friendshipRepository.findByUser1OrUser2(user, user);

        return relations.stream()
                .map(f -> {
                    User other = f.getUser1().equals(user) ? f.getUser2() : f.getUser1();
                    return new UserSummaryDTO(
                            other.getUserid(),
                            other.getName(),
                            other.getProfileImage()
                    );
                })
                .toList();
    }

    /** ✅ 받은 요청 조회 */
    @Transactional(readOnly = true)
    public List<FriendRequest> getPendingRequests(String receiverId) {
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("유저 없음"));
        return friendRequestRepository.findByReceiverAndStatus(receiver, FriendRequestStatus.PENDING);
    }


    /** ✅ 친구 요청 거절 */
    @Transactional
    public void rejectRequest(Long requestId) {
        FriendRequest req = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("요청 없음"));

        if (req.getStatus() != FriendRequestStatus.PENDING)
            throw new RuntimeException("이미 처리된 요청입니다.");

        req.setStatus(FriendRequestStatus.REJECTED);
    }

}
