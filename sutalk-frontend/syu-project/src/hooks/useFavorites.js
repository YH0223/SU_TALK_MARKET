"use client";

import { useEffect, useCallback } from "react";
import { useFavoriteStore } from "@/stores/useFavoriteStore";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * 즐겨찾기 훅 (JS)
 * - userId 준비되기 전엔 호출 보류
 * - 미로그인: 빈 목록
 * - 안전 토글/리패치 제공
 * - 스토어에서 이미 정규화된 favorites를 제공하므로 그대로 사용
 */
export const useFavorites = (autoFetch = true) => {
  const { userId, isReady } = useAuthStore();

  const {
    favorites,
    loading,
    error,
    fetchFavorites,
    toggleFavorite,
    isFavorite,
    clearError,
  } = useFavoriteStore();

  useEffect(() => {
    if (!autoFetch) return;

    // isReady가 명시되어 있고 false면 대기
    if (typeof isReady === "boolean" && !isReady) return;

    if (!userId) {
      typeof clearError === "function" && clearError();
      fetchFavorites(null); // 스토어에서 빈 목록 처리
      return;
    }

    fetchFavorites(userId);
  }, [autoFetch, isReady, userId, fetchFavorites, clearError]);

  const safeToggle = useCallback(
    (itemId) => {
      if (!userId) return Promise.resolve(false);
      return toggleFavorite(itemId, userId);
    },
    [toggleFavorite, userId]
  );

  const refetch = useCallback(() => {
    if (!userId) return Promise.resolve([]);
    return fetchFavorites(userId);
  }, [fetchFavorites, userId]);

  return {
    favorites, // 이미 정규화됨: { itemid, id, title, price, itemImages, likeCount }
    loading,
    error,
    isFavorite: (itemId) => (typeof isFavorite === "function" ? isFavorite(itemId, userId) : false),
    toggleFavorite: safeToggle,
    refetch,
  };
};
