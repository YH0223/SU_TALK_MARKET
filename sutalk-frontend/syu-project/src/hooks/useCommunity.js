"use client"

import { useEffect, useRef } from "react"
import { useCommunityStore } from "@/stores/useCommunityStore"

export const useCommunity = () => {
  const {
    posts,
    loading,
    error,
    filter,
    setFilter,
    fetchPosts,
    getVisiblePosts,
    canLoadMore,
    increaseVisibleCount,
    clearPosts,
  } = useCommunityStore()

  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    fetchPosts()
  }, [])

  useEffect(() => {
    clearPosts?.()
    fetchPosts()
  }, [filter])

  return {
    posts,
    loading,
    error,
    filter,
    setFilter,
    visiblePosts: getVisiblePosts(),
    canLoadMore: canLoadMore(),
    loadMore: () => increaseVisibleCount(10),
    refetch: fetchPosts,
  }
}
