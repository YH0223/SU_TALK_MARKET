package com.sutalk.backend.domain.location.controller;

import com.sutalk.backend.domain.location.dto.LocationMessageDTO;
import com.sutalk.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class LocationController {

    private final SimpMessagingTemplate template;
    private final UserRepository userRepository;

    @MessageMapping("/location.update")
    public void handleLocation(LocationMessageDTO message) {
        // ✅ userId 기반으로 이름 + 프로필 URL 보정
        userRepository.findByUserid(message.getUserId()).ifPresent(user -> {
            message.setName(user.getName());
            message.setProfileImage(user.getProfileImage()); // ✅ URL만 포함
        });

        template.convertAndSend("/topic/location", message);
    }
}