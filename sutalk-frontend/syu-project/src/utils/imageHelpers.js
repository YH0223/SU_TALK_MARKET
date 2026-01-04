// src/utils/imageHelpers.js

const DEFAULT_IMG = "/assets/default-image.png";

/**
 * 백엔드 ORIGIN 결정:
 * - VITE_FILE_BASE_URL: 정적(/uploads)까지 포함한 백엔드 오리진 (예: http://localhost:8080)
 * - 없으면 VITE_API_BASE_URL에서 '/api' 꼬리를 떼서 사용
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const FILE_BASE =
  (import.meta.env.VITE_FILE_BASE_URL || "").replace(/\/+$/, "") ||
  API_BASE.replace(/\/api$/i, "");

/** 상대경로를 절대 URL로 변환 */
export function toAbs(path) {
  if (!path || typeof path !== "string") return "";
  if (/^https?:\/\//i.test(path)) return path;

  // /uploads/** 는 FILE_BASE 기준으로 절대화
  if (path.startsWith("/uploads/")) return `${FILE_BASE}${path}`;

  // 그 외 API 라우팅 대상은 API_BASE 기준
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

/** 썸네일 URL 생성: /uploads/파일 → /uploads/thumbnails/thumb_파일 */
export function toThumbAbs(path) {
  if (!path) return DEFAULT_IMG;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/assets/") || path.startsWith("/placeholder")) return path;

  if (path.startsWith("/uploads/")) {
    const filename = path.split("/").pop() || "";
    if (!filename) return `${FILE_BASE}${path}`;
    return `${FILE_BASE}/uploads/thumbnails/thumb_${filename}`;
  }

  // 그 외는 원본으로
  return toAbs(path);
}

/** onError: 썸네일 실패 → 원본, 원본 실패 → 기본 이미지 */
export function createImageErrorHandler(originUrl) {
  return (e) => {
    const img = e.currentTarget;
    const triedOriginal = img.dataset.fallbackTried === "1";

    // 1차: 원본으로 교체
    if (!triedOriginal && originUrl) {
      img.dataset.fallbackTried = "1";
      img.src = originUrl.startsWith("http") ? originUrl : toAbs(originUrl);
      return;
    }
    // 2차: 기본 이미지
    img.src = DEFAULT_IMG;
  };
}

/** 단일 이미지 경로 추출 */
export function pickFirstPhotoPath(item) {
  if (!item) return null;
  const arr = item.itemImages ?? item.images ?? item.photos ?? [];
  const first = Array.isArray(arr) ? arr[0] : arr;
  if (!first) return null;
  if (typeof first === "string") return first;
  if (typeof first === "object")
    return first.photoPath || first.url || first.path || first.filePath || null;
  return null;
}

/** 모든 이미지 경로 추출 (필요 시 사용) */
export function pickAllPhotoPaths(item) {
  if (!item) return [];
  const arr = item.itemImages ?? item.images ?? item.photos ?? [];
  const list = Array.isArray(arr) ? arr : [arr];
  return list
    .map((v) =>
      typeof v === "string"
        ? v
        : v && typeof v === "object"
        ? v.photoPath || v.url || v.path || v.filePath
        : null,
    )
    .filter(Boolean);
}

/** 구버전 호환 */
export const handleImgError = (e) => {
  e.currentTarget.src = DEFAULT_IMG;
};
