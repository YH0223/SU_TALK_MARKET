"use client";

import { create } from "zustand";
import axios from "@/api/axiosInstance";

/** 숫자 가능 여부 안전 체크 */
const toNumOrNull = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * 서버 응답을 통일된 형태로 정규화
 * - 항상 아래 키를 보장:
 *   { itemid:number, id:string|number, title:string, price:number|null, itemImages:array, likeCount:number }
 * - 서버가 단순히 { itemid } 만 줄 때도 처리
 * - 서버가 { item:{...} } / { post:{...} } 로 감쌀 때도 처리
 */
function normalizeFavorites(data) {
  const arr = Array.isArray(data) ? data : (data && data.data) || [];
  return arr
    .map((v) => {
      const x = (v && (v.item || v.post)) || v || {};
      // id / itemid
      const itemid =
        toNumOrNull(x.itemid ?? x.itemId ?? x.id ?? v?.itemid ?? v?.itemId ?? v?.id);
      if (!Number.isFinite(itemid)) {
        // 아이디가 없으면 스킵
        return null;
      }
      // title
      const title = x.title ?? x.itemTitle ?? v?.title ?? v?.itemTitle ?? "제목 없음";
      // price
      const price = toNumOrNull(x.price ?? v?.price ?? x.amount ?? v?.amount);
      // images
      let images =
        x.itemImages ?? x.images ?? v?.images ?? v?.photos ?? [];
      images = Array.isArray(images) ? images : (images ? [images] : []);
      // likeCount
      const likeCount = toNumOrNull(x.likeCount ?? v?.likeCount ?? x.likes ?? v?.likes) ?? 0;

      return {
        itemid,
        id: itemid,          // 편의상 id도 동일 값
        title,
        price,
        itemImages: images,  // 이미지 헬퍼가 기대하는 키
        likeCount,
        __raw: v,            // 디버깅용
      };
    })
    .filter(Boolean);
}

const idEq = (a, b) => String(a) === String(b);

export const useFavoriteStore = create((set, get) => ({
  favorites: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),
  reset: () => set({ favorites: [], loading: false, error: null }),

  /** 즐겨찾기 목록 조회 */
  fetchFavorites: async (userId) => {
    if (!userId) {
      set({ favorites: [], loading: false, error: null });
      return [];
    }
    try {
      set({ loading: true, error: null });
      const uid = String(userId).trim();

      // 서버 경로: GET /favorites/{userId}
      const res = await axios.post(`/likes/my`,{userId:uid});

      const favorites = normalizeFavorites(res.data);
      set({ favorites, loading: false });
      return favorites;
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403 || status === 404) {
        set({ favorites: [], loading: false, error: null });
        return [];
      }
      console.error("❌ 관심 목록 가져오기 실패:", e);
      set({ error: e, favorites: [], loading: false });
      return [];
    }
  },

  /** 즐겨찾기 토글 (낙관적 업데이트는 페이지/컴포넌트에서 처리 가능, 여기선 실제 API만 호출) */
  toggleFavorite: async (itemId, userId) => {
    if (!userId) return false;

    const now = get().favorites || [];
    const exists = now.some((f) => idEq(f.itemid, itemId));

    try {
      if (exists) {
        // DELETE /favorites/{userId}/{itemId}
        await axios.delete(`/favorites/${encodeURIComponent(userId)}/${encodeURIComponent(itemId)}`, {
          withCredentials: true,
        });
        set({ favorites: now.filter((f) => !idEq(f.itemid, itemId)) });
      } else {
        // POST /favorites  { userId, itemId }
        await axios.post(`/favorites`, { userId, itemId }, { withCredentials: true });
        // 방금 추가한 항목은 최소 정보로 푸시 (다음 fetch에서 정규화된 전체 필드로 갱신됨)
        const numId = Number(itemId);
        set({
          favorites: [
            ...now,
            { itemid: numId, id: numId, title: "제목 없음", price: null, itemImages: [], likeCount: 0 },
          ],
        });
      }
      return true;
    } catch (e) {
      console.error("❌ 관심 목록 토글 실패:", e);
      set({ error: e });
      return false;
    }
  },

  /** 특정 아이템이 즐겨찾기인지 여부 */
  isFavorite: (itemId) => {
    const list = get().favorites || [];
    return list.some((f) => idEq(f.itemid, itemId));
  },
}));
