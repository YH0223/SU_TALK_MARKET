"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "@/api/axiosInstance"
import {useAuthStore} from "@/stores/useAuthStore.js";
/**
 * 검색 기록 및 추천 검색어 관리 커스텀 훅
 * @returns {Object} 검색 관련 상태 및 액션
 */
export function useSearchHistory() {
  const [history, setHistory] = useState([])
  const [searchInput, setSearchInput] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const userId = useAuthStore.getState().userId;

  // 검색 기록 불러오기
  const fetchHistory = useCallback(async () => {
    if (!userId) return

    try {
      const { data } = await axios.get(`/search-history`, {
        params: { userId },
      })
      const formatted = data.map((item, idx) => ({
        id: idx + 1,
        query: item,
      }))
      setHistory(formatted)
    } catch (error) {
      console.error("❌ 검색 기록 오류:", error)
      setHistory([])
    }
  }, [userId])

  // 초기 검색 기록 로드
  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // 추천 검색어 가져오기 (디바운스)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchInput.trim()) {
        setSuggestions([])
        return
      }

      try {
        const { data } = await axios.get(`/search-history/suggest`, {
          params: { keyword: searchInput },
        })
        setSuggestions(data)
      } catch (error) {
        console.error("❌ 추천어 요청 실패:", error)
        setSuggestions([])
      }
    }

    const delay = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(delay)
  }, [searchInput])

  // 검색 실행
  const executeSearch = useCallback(
    async (keyword) => {
      const query = keyword || searchInput.trim()
      if (!query) return null

      try {
        await axios.post(`/search-history`, {
          keyword: query,
          userId,
        })
      } catch (error) {
        console.error("❌ 검색어 저장 실패:", error)
      }

      return query
    },
    [searchInput, userId],
  )

  // 검색 기록 삭제
  const deleteHistoryItem = useCallback(
    async (keyword) => {
      try {
        await axios.delete(`/search-history/${encodeURIComponent(keyword)}`, {
          params: { userId },
        })
        setHistory((prev) => prev.filter((item) => item.query !== keyword))
      } catch (error) {
        console.error("❌ 삭제 실패:", error)
      }
    },
    [userId],
  )

  // 검색 기록 전체 삭제
  const deleteAllHistory = useCallback(async () => {
    try {
      await axios.delete(`/search-history`, { params: { userId } })
      setHistory([])
    } catch (error) {
      console.error("❌ 전체 삭제 실패:", error)
    }
  }, [userId])

  // 검색 입력 초기화
  const clearSearchInput = useCallback(() => {
    setSearchInput("")
    setSuggestions([])
  }, [])

  return {
    history,
    searchInput,
    setSearchInput,
    suggestions,
    executeSearch,
    deleteHistoryItem,
    deleteAllHistory,
    clearSearchInput,
  }
}
