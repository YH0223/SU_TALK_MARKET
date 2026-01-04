import React, {memo,useCallback, useEffect, useRef} from "react";
import { useAuthStore } from "@/stores/useAuthStore.js";
import { useModalStore } from "@/stores/useModalStore";

/**
 * ✅ ChatBody
 * - 같은 사람이 연속으로 보낸 메시지엔 첫 번째 메시지에만 프로필 표시
 * - 3분 이상 시간차가 있으면 새 블록으로 간주해 다시 프로필 표시
 */
const ChatBody =  memo(({ messages, profileCache }) => {
  const scrollRef = useRef(null);
  const currentUser = useAuthStore.getState().userId;
  const { openProfile } = useModalStore();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  const isSameBlock = (msg, prevMsg) => {
    if (!prevMsg) return false;
    if (msg.senderId !== prevMsg.senderId) return false;

    // 3분 이내면 같은 블록으로 간주
    const prev = new Date(prevMsg.sentAt);
    const curr = new Date(msg.sentAt);
    return curr - prev < 3 * 60 * 1000;
  };
  const handleOpenProfile = useCallback((id) => openProfile(id), [openProfile]);

  return (
      <div className="chat-body">
        {messages?.length ? (
            messages.map((msg, index) => {
              const isMine = msg.senderId === currentUser;
              const prevMsg = messages[index - 1];
              const sameBlock = isSameBlock(msg, prevMsg);
              const profile = profileCache[msg.senderId];

              return (
                  <div key={index} className={`message-row ${isMine ? "mine" : "other"}`}>
                    {/* ✅ 상대방 프로필: 첫 메시지 or 새 블록일 때만 표시 */}
                    {!isMine && !sameBlock ? (
                        <div
                            className="chat-avatar"
                            onClick={() => handleOpenProfile(msg.senderId)}
                            style={{ cursor: "pointer" }}
                            title={profile?.name || "프로필 보기"}
                        >
                          <img
                              src={profile?.image || "/default-image.png"}
                              alt="상대 프로필"
                              onError={(e) => (e.currentTarget.src = "/default-image.png")}
                          />
                        </div>
                    ) : (
                        !isMine && <div className="chat-avatar-placeholder" />
                    )}

                    <div className={`message ${isMine ? "sent" : "received"}`}>
                      <p>{msg.content || "(내용 없음)"}</p>
                      <div className="message-meta">
                        <span className="time">{formatTime(msg.sentAt)}</span>
                        {isMine && msg.isRead && <span className="read-check">✔</span>}
                      </div>
                    </div>
                  </div>
              );
            })
        ) : (
            <div className="no-message">아직 대화가 없습니다.</div>
        )}
        <div ref={scrollRef}></div>
      </div>
  );
});

export default ChatBody;
