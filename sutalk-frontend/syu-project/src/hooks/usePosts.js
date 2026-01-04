import { useEffect } from "react"
import { usePostStore } from "@/stores/usePostStore"

export const usePosts = (autoFetch = true, interval = 10000) => {
  const {
    posts,
    loading,
    error,
    fetchPosts,
    selectedCategory,
    sortOrder,
    setSelectedCategory,
    setSortOrder,
    getFilteredPosts,
  } = usePostStore()

  useEffect(() => {
    if (!autoFetch) return

    fetchPosts()

    if (interval > 0) {
      const intervalId = setInterval(fetchPosts, interval)
      return () => clearInterval(intervalId)
    }
  }, [autoFetch, interval, fetchPosts])

  return {
    posts,
    loading,
    error,
    selectedCategory,
    sortOrder,
    setSelectedCategory,
    setSortOrder,
    getFilteredPosts,
    refetch: fetchPosts,
  }
}
