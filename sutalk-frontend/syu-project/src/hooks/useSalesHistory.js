import { useState, useEffect, useCallback } from "react"
import axios from "@/api/axiosInstance"
import { useAuthStore } from "@/stores/useAuthStore.js"
import { showToast } from "../utils/toast.js"

export function useSalesHistory() {
  const [activeTab, setActiveTab] = useState("판매중")
  const [salesData, setSalesData] = useState({ 판매중: [], 예약중: [], 거래완료: [] })
  const [loading, setLoading] = useState(true)

  /** ✅ 판매 내역 불러오기 */
  const fetchSalesData = useCallback(async () => {
    setLoading(true)
    try {
      const userId = useAuthStore.getState().userId
      console.log("📦 [GET] 내 판매목록 요청:", "/items/mine", "userId =", userId)

      // ✅ axiosInstance가 이미 /api 붙여주므로 /items 로 시작해야 함
      const { data } = await axios.get("/items/mine", {
        params: userId ? { userId } : {},
      })

      console.log("✅ 서버 응답:", data)

      const rows = Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data)
              ? data
              : []

      const categorized = {
        판매중: rows.filter((p) => p.status === "판매중"),
        예약중: rows.filter((p) => p.status === "예약중"),
        거래완료: rows.filter((p) => p.status === "거래완료"),
      }

      console.log("✅ 분류 완료:", categorized)
      setSalesData(categorized)
    } catch (e) {
      console.error("❌ 판매 데이터 불러오기 실패:", e)
      if (e.response) console.error("서버 응답:", e.response.data)
      setSalesData({ 판매중: [], 예약중: [], 거래완료: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSalesData()
  }, [fetchSalesData])

  /** ✅ 상태 변경 (예약중 / 거래완료 / 판매중) */
  const changeStatus = useCallback(
      async (itemid, newStatusKorean) => {
        const url = `/items/${itemid}/status`
        try {
          console.log("📡 [PATCH] 상태 변경 요청:", url, newStatusKorean)

          // ✅ PATCH 요청 (정상 JSON)
          const response = await axios.patch(
              url,
              { status: newStatusKorean },
              {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
              }
          )

          console.log("✅ 상태 변경 성공:", response.data)
          await fetchSalesData()
          showToast("info", `상태가 "${newStatusKorean}"(으)로 변경되었습니다.`)
          return true
        } catch (e) {
          console.error("❌ 상태 변경 실패:", e)
          if (e.response) console.error("서버 응답:", e.response.data)
          showToast("error", "상태 변경 중 문제가 발생했습니다.")
          return false
        }
      },
      [fetchSalesData]
  )

  /** ✅ 게시글 삭제 */
  const deleteItem = useCallback(
      async (itemid) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return false
        const url = `/items/${itemid}`
        try {
          console.log("🗑️ [DELETE] 요청:", url)
          await axios.delete(url)
          await fetchSalesData()
          showToast("success", "삭제되었습니다.")
          return true
        } catch (e) {
          console.error("❌ 삭제 실패:", e)

          // ✅ 백엔드에서 400 Bad Request를 보낸 경우 (거래 내역 존재 등)
          if (e.response && e.response.status === 400) {
            const msg = e.response.data || "삭제할 수 없습니다."
            showToast("warning", msg)
          } else {
            showToast("error", "삭제에 실패했습니다. 다시 시도해주세요.")
          }

          return false
        }
      },
      [fetchSalesData]
  )

  const currentTabData = salesData[activeTab] ?? []

  console.log("🧩 렌더링 상태:", { loading, activeTab, currentTabData })

  return {
    activeTab,
    setActiveTab,
    salesData,
    currentTabData,
    loading,
    changeStatus,
    deleteItem,
    refetch: fetchSalesData,
  }
}