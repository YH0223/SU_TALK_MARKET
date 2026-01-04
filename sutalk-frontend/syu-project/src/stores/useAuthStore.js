import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * ✅ AuthStore: JWT 기반 인증 + 유저 상태 통합 관리
 * - Zustand + persist(localStorage) 기반
 * - accessToken / refreshToken 포함
 * - 자동 로그인 / 안전한 로그아웃 지원
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // === State ===
      userId: null,          // 로그인한 유저 ID
      name: null,            // ✅ 사용자 이름(닉네임 대체)
      accessToken: null,     // JWT Access Token
      refreshToken: null,    // Refresh Token
      isAuthenticated: false,// 로그인 여부

      // === Actions ===

      /**
       * ✅ 로그인 후 사용자 정보 + 토큰 설정
       * @param {Object} payload - 로그인 결과 데이터
       * @param {string} payload.userId - 사용자 ID
       * @param {string} payload.name - 사용자 이름
       * @param {string} payload.accessToken - 액세스 토큰
       * @param {string} payload.refreshToken - 리프레시 토큰 (선택)
       */
      login: ({ userId, name, accessToken, refreshToken }) => {
        if (!accessToken) {
          console.error("❌ accessToken 누락: 로그인 실패");
          return;
        }
        set({
          userId,
          name: name || null, // ✅ name 반영
          accessToken,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
        });
      },

      /**
       * ✅ 토큰만 갱신 (refresh 시)
       */
      updateToken: (newAccessToken, newRefreshToken) => {
        if (!newAccessToken) return;
        set({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken || get().refreshToken,
        });
      },

      /**
       * ✅ 이름 업데이트 (기존 nickname → name)
       */
      updateName: (name) => {
        set({ name });
      },

      /**
       * ✅ 완전한 로그아웃
       * - 모든 상태 초기화 + localStorage 정리
       */
      logout: () => {
        console.info("🚪 로그아웃 처리 중...");
        set({
          userId: null,
          name: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        localStorage.removeItem("auth-storage");
      },

      /**
       * ✅ 헬퍼: 현재 로그인 여부
       */
      isLoggedIn: () => get().isAuthenticated,

      /**
       * ✅ 헬퍼: 현재 유저 ID 반환
       */
      getUserId: () => get().userId,

      setUserId: (userId) => set({ userId }),

      /**
       * ✅ 헬퍼: 현재 액세스 토큰 반환
       */
      getToken: () => get().accessToken,
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        userId: state.userId,
        name: state.name, // ✅ persist 대상 변경
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
