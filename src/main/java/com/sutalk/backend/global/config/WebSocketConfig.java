package com.sutalk.backend.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // ✅ SockJS 대신 native websocket 사용
        registry.addEndpoint("/ws")
                .setAllowedOrigins("https://sutalkmarket.shop");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setSendTimeLimit(10_000)
                .setSendBufferSizeLimit(512 * 1024)
                .setTimeToFirstMessage(2000); // ✅ 세션 handshake 지연 줄이기
    }

}
