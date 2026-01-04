package com.sutalk.backend.domain.friend.controller;

import com.sutalk.backend.domain.friend.dto.UserSummaryDTO;
import com.sutalk.backend.domain.friend.entity.FriendRequest;
import com.sutalk.backend.domain.friend.service.FriendService;
import com.sutalk.backend.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    /** 친구 요청 보내기 */
    @PostMapping("/request")
    public ResponseEntity<String> sendRequest(
            @RequestParam String senderId,
            @RequestParam String receiverId) {
        friendService.sendRequest(senderId, receiverId);
        return ResponseEntity.ok("친구 요청 전송 완료");
    }

    /** 친구 요청 수락 */
    @PostMapping("/accept/{requestId}")
    public ResponseEntity<String> accept(@PathVariable Long requestId) {
        friendService.acceptRequest(requestId);
        return ResponseEntity.ok("친구 요청 수락 완료");
    }

    /** 친구 요청 거절 */
    @PostMapping("/reject/{requestId}")
    public ResponseEntity<String> reject(@PathVariable Long requestId) {
        friendService.rejectRequest(requestId);
        return ResponseEntity.ok("친구 요청 거절 완료");
    }

    /** 친구 목록 조회 */
    @GetMapping("/{userId}/list")
    public ResponseEntity<List<UserSummaryDTO>> getFriends(@PathVariable String userId) {
        return ResponseEntity.ok(friendService.getFriends(userId));
    }


    /** 받은 요청 목록 조회  (프론트 경로에 맞춰 수정) */
    @GetMapping("/requests/received/{receiverId}")
    public ResponseEntity<List<FriendRequest>> getReceivedRequests(@PathVariable String receiverId) {
        return ResponseEntity.ok(friendService.getPendingRequests(receiverId));
    }
}
