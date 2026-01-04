import React, { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * ✅ ChatFooter (최종 안정 버전)
 * - 메시지를 서버에만 보내고, UI 갱신은 ChatRoom에서만 처리
 */
const ChatFooter = ({ stompClient, chatRoomId, isConnected }) => {
  const [message, setMessage] = useState("");
  const senderId = useAuthStore.getState().userId;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !isConnected || !stompClient) return;

    const clientId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const payload = {
      chatRoomId: Number(chatRoomId),
      senderId,
      content: message.trim(),
      clientId,
    };

    try {
      stompClient.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(payload),
      });
      console.log("📤 메시지 전송됨:", payload);
      setMessage("");
    } catch (err) {
      console.error("❌ 메시지 전송 실패:", err);
    }
  };

  return (
    <form className="chat-footer" onSubmit={handleSendMessage}>
      <input
        type="text"
        placeholder={
          isConnected ? "메시지를 입력하세요..." : "서버 연결 중입니다..."
        }
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={!isConnected}
      />
      <button type="submit" disabled={!isConnected}>
        전송
      </button>
    </form>
  );
};

export default ChatFooter;
