import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import axios from "@/api/axiosInstance"
import {useAuthStore} from "@/stores/useAuthStore.js";
import {showToast} from "../utils/toast.js";
/**
 * 채팅 관련 액션들을 관리하는 훅
 */
export const useChatActions = (chatRoomId, itemId, chatSellerId, transactionId) => {
  const navigate = useNavigate()

  // 거래 완료
  const handleCompleteDeal = useCallback(async () => {
    try {
      await axios.post(`/items/${itemId}/complete`, null, { params: { chatRoomId } })
      showToast("success","거래가 완료되었습니다.")
      return true
    } catch (err) {
      showToast("error","거래 완료 실패")
      console.error(err)
      return false
    }
  }, [itemId, chatRoomId])

  // 후기 작성
  const handleReviewWrite = useCallback(() => {
    if (!transactionId) {
      showToast("error","리뷰 대상 정보가 없습니다.")
      return
    }

    const senderId = useAuthStore.getState().userId;
    navigate("/review", {
      state: { itemId, buyerId: senderId, sellerId: chatSellerId, transactionId },
    })
  }, [itemId, chatSellerId, transactionId, navigate])

  // 채팅방 나가기
  const handleLeaveChat = useCallback(async () => {
    if (!window.confirm("정말 채팅방을 나가시겠습니까?")) return

    try {
      await axios.delete(`/chat-rooms/${chatRoomId}`)
      showToast("success","채팅방이 삭제되었습니다.")
      navigate("/chatlist", { replace: true })
    } catch (err) {
      showToast("error","채팅방 삭제에 실패했습니다.")
      console.error(err)
    }
  }, [chatRoomId, navigate])

  // 상대방 프로필 보기
  const handleViewProfile = useCallback(
    (buyerId) => {
      const senderId = useAuthStore.getState().userId;
      const opponentId = senderId === chatSellerId ? buyerId : chatSellerId

      if (!opponentId) {
        showToast("error","상대방 정보를 불러오지 못했습니다.")
        return
      }

      navigate(`/profile/seller/${opponentId}`)
    },
    [chatSellerId, navigate],
  )

  return {
    handleCompleteDeal,
    handleReviewWrite,
    handleLeaveChat,
    handleViewProfile,
  }
}
