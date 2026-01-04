"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatBody from "./ChatBody";
import ChatFooter from "./ChatFooter";
import { FaBars, FaArrowLeft } from "react-icons/fa";
import "../Loader/Loader.css";
import "./Chat.css";
import { MoonLoader } from "react-spinners";
import {
  useChatRoomMeta,
  useChatMessages,
  useTransactionId,
  useItemStatus,
} from "@/hooks/useChatRoom";
import { useChatActions } from "@/hooks/useChatActions";
import { useAuthStore } from "@/stores/useAuthStore.js";
import { Client } from "@stomp/stompjs";
import { useModalStore } from "@/stores/useModalStore";
import axios from "@/api/axiosInstance";

const ChatRoom = () => {
  const { chatRoomId } = useParams();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const senderId = useAuthStore.getState().userId;
  const [profileCache, setProfileCache] = useState({});
  const { openProfile } = useModalStore();

  /** ✅ 채팅방 메타 데이터 */
  const { itemId, chatSellerId, buyerId, itemTitle } = useChatRoomMeta(chatRoomId);

  /** ✅ 메시지 목록 */
  const { messages, setMessages, loading: messagesLoading } = useChatMessages(chatRoomId);

  /** ✅ 거래 및 상태 관리 */
  const transactionId = useTransactionId(itemId, senderId);
  const { itemStatus, isCompleted, setIsCompleted, setItemStatus } =
    useItemStatus(itemId, itemTitle);

  /** ✅ 액션 함수 모음 */
  const {
    handleCompleteDeal: completeDeal,
    handleReviewWrite,
    handleLeaveChat,
    handleViewProfile,
  } = useChatActions(chatRoomId, itemId, chatSellerId, transactionId);

  const isBuyer = senderId && senderId !== chatSellerId;

  /** ✅ 메시지 정규화 */
  const normalizeMessage = (msg) => {
    const sender =
      msg.senderId || msg.sender?.userid || msg.sender?.userId || msg.sender;
    return {
      chatRoomId: msg.chatRoomId,
      senderId: sender,
      content: msg.content,
      clientId: msg.clientId || msg.id || `${Date.now()}-${Math.random()}`,
      sentAt: msg.sentAt || null,
      isRead: msg.isRead ?? false,
      messageId: msg.messageId ?? null,
    };
  };

  /** ✅ STOMP 연결 */
  const connectStomp = useCallback(
    (roomId) => {
      const base = import.meta.env.VITE_API_BASE_URL || "https://sutalkmarket.shop:8080";
      const wsUrl = base.replace("http", "ws") + "/ws";
      console.log("🛰️ STOMP 연결 시도:", wsUrl);

      const client = new Client({
        brokerURL: wsUrl,
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: (msg) => {
          if (msg.includes("CONNECTED")) console.log("✅ STOMP CONNECTED");
        },
        onConnect: () => {
          console.log("🟢 STOMP 연결 성공");
          setIsConnected(true);
          stompClientRef.current = client;

          // 기존 구독 제거
          if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
            subscriptionRef.current = null;
          }

          /** ✅ 메시지 수신 */
          subscriptionRef.current = client.subscribe(`/topic/chat/${roomId}`, (msg) => {
            const body = JSON.parse(msg.body);
            const normalized = normalizeMessage(body);

            setMessages((prev) => {
              const exists = prev.some((m) => m.clientId === normalized.clientId);
              if (exists) {
                return prev.map((m) =>
                  m.clientId === normalized.clientId
                    ? { ...m, messageId: normalized.messageId }
                    : m
                );
              }
              return [...prev, normalized];
            });

            // 상대방 메시지 수신 시 읽음 처리
            if (normalized.senderId !== senderId) {
              client.publish({
                destination: "/app/chat.read",
                body: JSON.stringify({ chatRoomId: roomId, readerId: senderId }),
              });
              console.log("👁️ 읽음 요청 전송:", normalized);
            }
          });

          /** ✅ 읽음 이벤트 수신 */
          client.subscribe(`/topic/chat/${roomId}/read`, (msg) => {
            console.log("📩 읽음 이벤트 수신:", msg.body);
            try {
              const readMessageIds = JSON.parse(msg.body);
              setMessages((prev) =>
                prev.map((m) =>
                  readMessageIds.includes(m.messageId) ||
                  readMessageIds.some((id) => m.clientId?.includes(id.toString()))
                    ? { ...m, isRead: true }
                    : m
                )
              );
            } catch (e) {
              console.warn("⚠️ JSON 파싱 실패:", msg.body);
            }
          });

          /** ✅ 입장 시 읽음 요청 */
          if (senderId) {
            client.publish({
              destination: "/app/chat.read",
              body: JSON.stringify({ chatRoomId: roomId, readerId: senderId }),
            });
          }
        },
        onWebSocketClose: () => {
          console.warn("🔌 WebSocket 연결 종료됨");
          setIsConnected(false);
        },
      });

      stompClientRef.current = client;
      client.activate();
    },
    [senderId, setMessages]
  );

  /** ✅ 연결 관리 */
  useEffect(() => {
    if (!chatRoomId) return;
    connectStomp(chatRoomId);

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
        setIsConnected(false);
      }
    };
  }, [chatRoomId, connectStomp]);

  /** ✅ 상대방 프로필 캐시 로딩 */
  useEffect(() => {
    if (!chatSellerId || !buyerId) return;

    const fetchProfiles = async () => {
      const ids = [chatSellerId, buyerId].filter(Boolean);
      const cache = {};
      for (const id of ids) {
        try {
          const { data } = await axios.get(`/users/${id}`);
          cache[id] = {
            userId: id,
            name: data.name || data.userid || id,
            image: data.profileImage || "/default-image.png",
            averageRating: data.averageRating ?? 0,
            reviewCount: data.reviewCount ?? 0,
          };
        } catch {
          cache[id] = {
            userId: id,
            name: id,
            image: "/default-image.png",
            averageRating: 0,
            reviewCount: 0,
          };
        }
      }
      setProfileCache(cache);
    };

    fetchProfiles();
  }, [chatSellerId, buyerId]);

  /** ✅ 거래 완료 */
  const handleCompleteDeal = async () => {
    const success = await completeDeal();
    if (success) {
      setIsCompleted(true);
      setItemStatus("거래완료");
    }
  };

  const handleBack = () => navigate("/chatlist", { replace: true });

  /** ✅ 친구/거래 채팅방 구분 */
  const isTradeRoom = Boolean(itemId);
  const opponentId = senderId === chatSellerId ? buyerId : chatSellerId;
  const opponentProfile = profileCache[opponentId];
  const opponentName = opponentProfile?.name || opponentId || "상대방";

  /** 🟡 로딩 상태 */
  if (!chatRoomId || messagesLoading) {
    return (
      <div className="loader-overlay">
        <MoonLoader color="#2670ff" size={40} />
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-room">
        {/* ✅ 헤더 */}
        <header className="chat-header">
          <div className="chat-header-left">
            <button className="back-button" onClick={handleBack}>
              <FaArrowLeft className="back-icon" />
            </button>

            <div className="chat-header-title">
              {isTradeRoom ? itemTitle || "상품명 없음" : opponentName}
            </div>
          </div>

          <div className="chat-header-right">
            {isTradeRoom && !isCompleted && senderId === chatSellerId && (
              <button onClick={handleCompleteDeal} className="complete-button">
                거래 완료
              </button>
            )}
            <button
              className="menu-icon-button"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <FaBars />
            </button>
            {menuOpen && (
              <div className="chat-menu-dropdown">
                <button onClick={() => handleViewProfile(opponentId)}>
                  👤 상대방 프로필
                </button>
                <button onClick={handleLeaveChat}>🚪 채팅방 나가기</button>
              </div>
            )}
          </div>
        </header>

        {/* ✅ 본문 */}
        <ChatBody messages={messages} profileCache={profileCache} />

        {/* ✅ 하단 영역 */}
        {isTradeRoom && isCompleted && isBuyer ? (
          <div className="review-banner">
            <button onClick={handleReviewWrite}>📝 후기 작성하기</button>
          </div>
        ) : null}

        {isTradeRoom && isCompleted ? (
          <div className="chat-footer completed-banner">
            거래가 완료된 채팅방입니다.
          </div>
        ) : (
          <ChatFooter
            stompClient={stompClientRef.current}
            chatRoomId={chatRoomId}
            isConnected={isConnected}
          />
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
