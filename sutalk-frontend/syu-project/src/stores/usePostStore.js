// src/stores/usePostStore.js
import { create } from "zustand"
import axios from "@/api/axiosInstance"

// ✅ 외부 함수로 분리 (참조 고정)
function filterAndSortPosts(posts, category, sortOrder, searchQuery = "") {
  let result = posts.filter((post) => post.status !== "거래완료")

  if (category !== "전체") {
    result = result.filter(
        (post) => (post.category || "").toLowerCase().trim() === category.toLowerCase().trim()
    )
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    result = result.filter(
        (post) =>
            (post.title?.toLowerCase() || "").includes(q) ||
            (post.description?.toLowerCase() || "").includes(q)
    )
  }

  if (sortOrder === "최신순") result.sort((a, b) => Number(b.regdate) - Number(a.regdate))
  else if (sortOrder === "가격↑") result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
  else if (sortOrder === "가격↓") result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))

  return result
}

export const usePostStore = create((set, get) => ({
  posts: [],
  loading: false,
  error: null,
  selectedCategory: "전체",
  sortOrder: "최신순",

  setPosts: (posts) => set({ posts }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSortOrder: (order) => set({ sortOrder: order }),

  fetchPosts: async () => {
    set({ loading: true, error: null })
    try {
      const response = await axios.get("/items")
      set({
        posts: Array.isArray(response.data) ? response.data : [],
        loading: false,
      })
    } catch (error) {
      console.error("❌ 데이터 가져오기 실패:", error)
      set({ error: error.message, loading: false })
    }
  },

  // ✅ 함수 내부에서 외부 헬퍼 호출 → 참조는 고정됨
  getFilteredPosts: (searchQuery = "") => {
    const { posts, selectedCategory, sortOrder } = get()
    return filterAndSortPosts(posts, selectedCategory, sortOrder, searchQuery)
  },
}))
