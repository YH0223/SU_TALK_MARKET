// src/api/Socket.js

import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

let stompClient = null;

export const connectSocket = (chatRoomId, onMessage) => {
  const socket = new SockJS("https://sutalkmarket.shop/ws"); // ✅ Spring WebSocket 엔드포인트
  stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    console.log("✅ STOMP 연결 성공");

    // 구독
    stompClient.subscribe(`/topic/chat/${chatRoomId}`, (message) => {
      const body = JSON.parse(message.body);
      onMessage(body);
    });
  });

  return stompClient;
};

export const disconnectSocket = () => {
  if (stompClient) {
    stompClient.disconnect(() => console.log("🔌 STOMP 연결 종료"));
    stompClient = null;
  }
};

export const sendMessage = (chatRoomId, message) => {
  if (!stompClient || !stompClient.connected) return;

  stompClient.send(
    "/app/chat.send",
    {},
    JSON.stringify({
      chatRoomId,
      senderId: message.senderId,
      content: message.content,
    }),
  );
};
