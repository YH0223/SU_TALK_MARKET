// src/hooks/useChatRoom.js
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import axios from "@/api/axiosInstance"
import { Client } from "@stomp/stompjs"

/**
 * ✅ 채팅방 메타데이터를 관리하는 훅
 */
export const useChatRoomMeta = (chatRoomId) => {
  const location = useLocation();
  const [itemId, setItemId] = useState(location.state?.itemId || null);
  const [chatSellerId, setChatSellerId] = useState(location.state?.sellerId || null);
  const [buyerId, setBuyerId] = useState(location.state?.buyerId || null);
  const [itemTitle, setItemTitle] = useState(location.state?.itemTitle || "");

  // ✅ URL 쿼리 보강
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (!itemId && q.get("itemId")) setItemId(q.get("itemId"));
    if (!chatSellerId && q.get("sellerId")) setChatSellerId(q.get("sellerId"));
  }, [location.search]);

  // ✅ 메타 정보 로딩 (한 번만 실행)
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`/chat-rooms/${chatRoomId}`);
        const data = res.data || {};

        setItemId(data.itemId ?? data.postId ?? null);
        setChatSellerId(data.sellerId ?? data.sellerUserid ?? null);
        setBuyerId(data.buyerId ?? data.buyer_userid ?? null);

        if (!itemTitle && data.itemTitle) setItemTitle(data.itemTitle);
      } catch (err) {
        console.error("❌ 채팅방 정보 조회 실패:", err);
      }
    })();
  }, [chatRoomId]);

  return { itemId, chatSellerId, buyerId, itemTitle };
};


/**
 * ✅ 채팅 메시지를 관리하는 훅 (정규화 추가)
 */
export const useChatMessages = (chatRoomId) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  // ✅ 메시지 정규화 함수 (ChatRoom.jsx 와 동일)
  const normalizeMessage = (msg) => {
    const sender =
      msg.senderId || msg.sender?.userid || msg.sender?.userId || msg.sender
    return {
      chatRoomId: msg.chatRoomId,
      senderId: sender,
      content: msg.content,
      clientId: msg.clientId || msg.id || `${Date.now()}-${Math.random()}`,
      sentAt: msg.sentAt || null,
      isRead: msg.isRead ?? msg.read ?? false, // ✅ 핵심: isRead + read 둘 다 대응
      messageId: msg.messageId ?? null,
    }
  }

  // ✅ 초기 메시지 로드 (isRead 유지)
  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const res = await axios.get(`/chat-messages/${chatRoomId}`)
        const rawData = Array.isArray(res.data) ? res.data : []

        // ✅ 정규화 적용 (STOMP 메시지와 구조 일치시킴)
        const normalized = rawData.map(normalizeMessage)
        setMessages(normalized)

        console.log("📩 초기 메시지 로드 완료:", normalized)
      } catch (err) {
        console.error("❌ 메시지 조회 실패:", err)
        setMessages([])
      } finally {
        setLoading(false)
      }
    })()
  }, [chatRoomId])

  return { messages, setMessages, loading }
}

/**
 * ✅ WebSocket 연결을 관리하는 훅
 */
export const useWebSocket = (chatRoomId, onMessage) => {
  const [stompClient, setStompClient] = useState(null)

  useEffect(() => {
    const WS_BASE = (() => {
      const env = import.meta.env.VITE_API_BASE_URL
      if (env && typeof env === "string") {
        return env.replace(/^http/, "ws").replace(/\/api$/, "")
      }
      const proto = window.location.protocol === "https:" ? "wss" : "ws"
      const host = window.location.hostname
      const port = "8080"
      return `${proto}://${host}:${port}`
    })()

    const client = new Client({
      brokerURL: `${WS_BASE}/ws`,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/chat/${chatRoomId}`, (message) => {
          const data = JSON.parse(message.body)
          onMessage(data)
        })
        setStompClient(client)
      },
      onStompError: (frame) => {
        console.error("❌ STOMP 오류:", frame)
      },
    })

    client.activate()
    return () => client?.deactivate()
  }, [chatRoomId, onMessage])

  return stompClient
}

/**
 * ✅ 거래 ID를 조회하는 훅
 */
export const useTransactionId = (itemId, senderId) => {
  const [transactionId, setTransactionId] = useState(null)

  useEffect(() => {
    if (!itemId || !senderId) {
      console.warn("🚫 거래 ID 조회 중단: itemId 또는 senderId가 없음", { itemId, senderId })
      return
    }

    const fetchTransaction = async () => {
      try {
        const res = await axios.get(`/transactions/item/${itemId}/user/${senderId}`)
        setTransactionId(res.data?.transactionId ?? res.data?.transactionid ?? null)
      } catch (err) {
        if (err.response?.status === 400) {
          console.warn("⚠️ 거래 ID 400 Bad Request 무시:", err.response.data)
          setTransactionId(null)
          return
        }
        console.error("❌ 거래 ID 조회 실패:", err)
      }
    }

    fetchTransaction()
  }, [itemId, senderId])

  return transactionId
}

/**
 * ✅ 아이템 상태를 관리하는 훅
 */
export const useItemStatus = (itemId, itemTitle) => {
  const [itemStatus, setItemStatus] = useState("")
  const [isCompleted, setIsCompleted] = useState(false)
  const [title, setTitle] = useState(itemTitle)

  useEffect(() => {
    if (!itemId) return
    ;(async () => {
      try {
        const res = await axios.get(`/items/${itemId}`)
        const data = res.data || {}
        setItemStatus(data.status || "")
        if (!title && data.title) setTitle(data.title)
        if (data.status === "거래완료") setIsCompleted(true)
      } catch (err) {
        console.error("❌ 아이템 정보 조회 실패:", err)
      }
    })()
  }, [itemId, title])

  return { itemStatus, isCompleted, title, setIsCompleted, setItemStatus }
}
