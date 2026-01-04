// src/api/axiosInstance.js
import axiosLib from "axios";
import { useAuthStore } from "@/stores/useAuthStore";

// 우선순위: ENV > /api(프록시) > localhost:8080/api
const fallbackBase =
  typeof window !== "undefined" && window.location?.origin
    ? "/api"
    : "https://sutalkmarket.shop/api";

  const rawBase = import.meta.env.VITE_API_BASE_URL || fallbackBase;
  const baseURL = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;
  console.log("👉 axiosInstance baseURL 설정값:", baseURL);

const axios = axiosLib.create({
  baseURL,
  headers: {},
  // 쿠키(JWT) 사용 시 필요. (Spring: allowCredentials + 정확한 origin 설정 필수)
  withCredentials: true,
});

// ── 요청 인터셉터: 필요 시 토큰 헤더 주입 ─────────────────────────────
// 요청 인터셉터
axios.interceptors.request.use((config) => {
    const token = useAuthStore.getState().getToken();
    console.log(token)
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ── 응답 인터셉터: 에러 공통 처리 템플릿 ─────────────────────────────
axios.interceptors.response.use(
    (res) => res,
    async (error) => {
        const status = error?.response?.status;


        // 401 발생 시 로그만 찍고 바로 로그아웃 처리
        if (status === 401) {
            const currentPath = window.location.pathname;
            if (!currentPath.includes("/login")) {
                useAuthStore.getState().logout();
                window.location.replace("/login");
            } else {
                console.warn("🚫 로그인 페이지에서는 redirect 생략");
            }
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);


export default axios;
