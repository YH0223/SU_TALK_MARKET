import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import axios from "@/api/axiosInstance"
import {useAuthStore} from "../stores/useAuthStore.js";
import { showToast } from "@/utils/toast";
/**
 * 채팅 시작 로직을 관리하는 훅
 */
export const useStartChat = () => {
  const navigate = useNavigate()

  const startChat = useCallback(
    async (postId, sellerId, postTitle) => {
      const buyerId = useAuthStore.getState().userId;

      if (!buyerId || !sellerId) {
        showToast("error","로그인 또는 판매자 정보가 필요합니다.")
        return
      }

      try {
        // 거래 생성
        const transactionRes = await axios.post("/transactions", {
          buyerId,
          sellerId,
          itemId: postId,
        })

        const transactionData = transactionRes.data
        const transactionId = transactionData.transactionId ?? transactionData.transactionid

        if (!transactionId) throw new Error("transactionId 없음")

        // 채팅방 생성
        const chatRoomRes = await axios.post("/chat-rooms", {
          itemTransactionId: transactionId,
          buyerId,
          sellerId,
        })

        const chatRoomData = chatRoomRes.data
        const chatRoomId = chatRoomData.chatroomId || chatRoomData.chatRoomId || chatRoomData.chatroomid

        if (!chatRoomId) throw new Error("chatRoomId 없음")

        const q = `?itemId=${encodeURIComponent(postId)}&sellerId=${encodeURIComponent(sellerId)}`

        navigate(`/chat/${chatRoomId}${q}`, {
          replace: false,
          state: { itemId: postId, sellerId, itemTitle: postTitle ?? "" },
        })
      } catch (error) {
        console.error("❌ 채팅 시작 실패:", error)
        showToast("error","채팅을 시작하는 도중 오류가 발생했습니다.")
      }
    },
    [navigate],
  )

  return { startChat }
}
