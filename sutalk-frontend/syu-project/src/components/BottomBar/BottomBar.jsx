import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons"
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons"
import { useNavigate } from "react-router-dom"
import "./BottomBar.css"
import axios from "@/api/axiosInstance"
import { useAuthStore } from "@/stores/useAuthStore"
import SpeedDial from "@/components/SpeedDial/SpeedDial"
import {FiPlus, FiX} from "react-icons/fi";
import {showToast} from "../../utils/toast.js";

const BottomBar = ({ postId, price, sellerId }) => {
  const [isFavorite, setIsFavorite] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const navigate = useNavigate()
  const userId = useAuthStore((state) => state.userId)

  // 👉 좋아요 초기화
  useEffect(() => {
    let cancelled = false

    const fetchLikeStatus = async () => {
      if (!postId) return
      try {
        const [isLikedRes, countRes] = await Promise.all([
          axios.get(`/likes/${postId}/is-liked`, {
            params: { userId: userId || "" },
          }),
          axios.get(`/likes/${postId}/count`),
        ])

        if (!cancelled) {
          setIsFavorite(!!isLikedRes.data)
          setLikeCount(Number(countRes.data ?? 0))
        }
      } catch (err) {
        console.error("❌ 좋아요 상태 불러오기 실패:", err)
      }
    }

    fetchLikeStatus()
    return () => {
      cancelled = true
    }
  }, [postId, userId])

  // 👉 좋아요 토글 (낙관적 업데이트 + 롤백)
  const handleFavoriteClick = async () => {
    if (!userId) {
      showToast("info","로그인이 필요합니다.")
      return
    }
    if (isProcessing) return
    setIsProcessing(true)

    const prev = isFavorite
    const prevCount = likeCount

    // 낙관적 UI 업데이트
    setIsFavorite(!prev)
    setLikeCount(prev ? Math.max(0, prevCount - 1) : prevCount + 1)

    try {
      const method = prev ? "delete" : "post"
      const res = await axios({
        url: `/likes/${postId}`,
        method,
        params: { userId },
      })

      if (typeof res.data?.likeCount !== "undefined") {
        setLikeCount(Number(res.data.likeCount))
      }
      if (typeof res.data?.liked !== "undefined") {
        setIsFavorite(!!res.data.liked)
      }
    } catch (err) {
      console.error("❌ 좋아요 토글 실패:", err)
      // 실패 시 롤백
      setIsFavorite(prev)
      setLikeCount(prevCount)
      showToast("error","좋아요 처리에 실패했습니다.")
    } finally {
      setIsProcessing(false)
    }
  }

  // 👉 채팅 시작
  const handleChatClick = async () => {
    if (!userId || !sellerId) {
      showToast("error","로그인 또는 판매자 정보가 필요합니다.")
      return
    }

    try {
      // 1) 거래 생성
      const { data: transactionData } = await axios.post(`/transactions`, {
        buyerId: userId,
        sellerId,
        itemId: postId,
      })
      const transactionId =
        transactionData?.transactionid ||
        transactionData?.transactionId ||
        transactionData?.id;

      if (!transactionId) {
        console.log("🚨 transactionData 응답:", transactionData)
        throw new Error("transactionId 없음")
      }


      // 2) 채팅방 생성
      const { data: chatRoomData } = await axios.post(`/chat-rooms`, {
        itemTransactionId: transactionId,
        buyerId: userId,
        sellerId,
      })
      const chatRoomId = chatRoomData.chatroomId || chatRoomData.chatRoomId || chatRoomData.chatroomid
      if (!chatRoomId) throw new Error("chatRoomId 없음")

      // 3) 채팅방 이동
      const q = `?itemId=${encodeURIComponent(postId)}&sellerId=${encodeURIComponent(sellerId)}`
      navigate(`/chat/${chatRoomId}${q}`, {
        replace: false,
        state: { itemId: postId, sellerId },
      })
    } catch (error) {
      console.error("❌ 채팅 시작 실패:", error)
      showToast("error","채팅 시작 중 오류 발생")
    }
  }

  return (
      <div className="bottom-bar">
        <div className="bottom-bar-left">
          <FontAwesomeIcon
              icon={isFavorite ? solidHeart : regularHeart}
              className={`heart-icon ${isFavorite ? "favorite" : ""}`}
              onClick={handleFavoriteClick}
          />
          <span className="like-count">{likeCount}</span>
          <span className="price">
          {typeof price === "number" ? price.toLocaleString() : String(price)}원
        </span>
        </div>

        <button className="bottom-chat-button" onClick={handleChatClick}>
          💬 채팅하기
        </button>

      </div>
  )
}

export default BottomBar
