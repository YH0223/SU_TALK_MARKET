import { create } from "zustand"
import { getHotPosts, getNewPosts, getPostsByCategory } from "@/components/Community/community.api"

export const useCommunityStore = create((set, get) => ({
  // State
  posts: [],
  loading: false,
  error: null,
  filter: "new", // 'hot' | 'new' | 'FREE' | 'FRIENDSHIP' | 'INFO' | 'JOBS' | 'HOBBY'
  visibleCount: 10,

  // Actions
  setFilter: (filter) => set({ filter, visibleCount: 10 }),

  setPosts: (posts) => set({ posts }),

  clearPosts: () => set({ posts: [], visibleCount: 10 }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  increaseVisibleCount: (amount = 10) => set((state) => ({ visibleCount: state.visibleCount + amount })), 

  // Async actions
  fetchPosts: async () => {
    const { filter } = get()
    set({ loading: true, error: null })

    try {
      let data;
      if (filter === "hot") {
        data = await getHotPosts();
      } else if (filter === "new") {
        data = await getNewPosts();
      } else {
        data = await getPostsByCategory(filter.toLowerCase());
      }
      
      set({
        posts: Array.isArray(data) ? data : [],
        loading: false,
      })
    } catch (error) {
      console.error("❌ 커뮤니티 데이터 가져오기 실패:", error)
      set({ error: error.message, loading: false })
    }
  },
  // Computed
  getVisiblePosts: () => {
    const { posts, visibleCount } = get()
    return posts.slice(0, visibleCount)
  },

  canLoadMore: () => {
    const { posts, visibleCount } = get()
    return visibleCount < posts.length
  },
}))
