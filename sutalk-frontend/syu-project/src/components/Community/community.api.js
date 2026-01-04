import axios from '@/api/axiosInstance';
import {useAuthStore} from "@/stores/useAuthStore.js";

// 커뮤니티 API 루트 (axiosInstance baseURL이 '/api'라면 여기엔 '/api' 붙이지 말 것)
const API_URL = "/community";

// 인기 게시글 목록 조회
export const getHotPosts = async () => {
  const { data } = await axios.get(`${API_URL}/posts/hot`);
  return data.map(post => ({
    ...post,
    comments: post.commentsCount,
    likes: typeof post.likes === "number" ? post.likes : 0,
  }));
};

// 최신 게시글 목록 조회
export const getNewPosts = async () => {
  const { data } = await axios.get(`${API_URL}/posts/new`);
  return data.map(post => ({
    ...post,
    comments: post.commentsCount,
    likes: typeof post.likes === "number" ? post.likes : 0,
  }));
};

// 카테고리별 게시글 목록 조회
export const getPostsByCategory = async (category) => {
  const { data } = await axios.get(`${API_URL}/posts/category/${category}`);
  return data.map(post => ({
    ...post,
    comments: post.commentsCount,
    likes: typeof post.likes === "number" ? post.likes : 0,
  }));
};

// 게시글 상세 조회 (userId를 쿼리로 넘겨 hasLiked 계산)
export const getPostById = async (postId) => {
  const userId = useAuthStore.getState().userId || null;
  const { data } = await axios.get(`${API_URL}/posts/${postId}`, {
    params: userId ? { userId } : {},
  });
  // 방어적 기본값
  return {
    ...data,
    likes: typeof data.likes === "number" ? data.likes : 0,
    hasLiked: typeof data.hasLiked === "boolean" ? data.hasLiked : false,
    comments: Array.isArray(data.comments) ? data.comments : [],
  };
};

// 댓글 작성
export const addCommentToPost = async (postId, { content, authorId }) => {
  const { data } = await axios.post(`${API_URL}/posts/${postId}/comments`, { content, authorId });
  return data;
};

export const likePost = async (postId) => {
  const userId = useAuthStore.getState().userId;
  if (!userId) throw new Error("LOGIN_REQUIRED");


  const { data } = await axios.post(`${API_URL}/posts/${postId}/like`, { userId });

  // 서버에서 { hasLiked, likes } 반환하도록 설계
  return {
    hasLiked: !!data?.hasLiked,
    likes: Number(data?.likes ?? 0),
    userId: userId
  };
};

// 새 게시글 작성
// ✅ FIX: FormData를 받아 multipart/form-data 헤더와 함께 전송하도록 수정
export const createPost = async (formData) => {
  const { data } = await axios.post('/community/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

// 신고 제출
export const submitReport = async (reportData) => {
  await axios.post('/reports/submit', reportData);
};

// 게시글 삭제
export const deletePost = async (postId) => {
  // AuthStore에서 현재 사용자 ID 가져오기
  const userId = useAuthStore.getState().userId
  if (!userId) {
    console.error("Delete attempt without login")
    throw new Error("LOGIN_REQUIRED")
  }

  // DELETE /api/community/posts/{postId}?userId={userId}
  // 컨트롤러가 @RequestParam으로 받으므로 params 객체에 담아 전송
  const { data } = await axios.delete(`${API_URL}/posts/${postId}`, {
    params: { userId },
  })

  // 성공 시 (204 No Content) data는 undefined일 수 있음
  return data
}

export const deleteComment = async (commentId) => {
  const userId = useAuthStore.getState().userId
  if (!userId) {
    console.error("Comment delete attempt without login")
    throw new Error("LOGIN_REQUIRED")
  }

  // DELETE /api/community/comments/{commentId}?userId={userId}
  const { data } = await axios.delete(`/community/comments/${commentId}`, {
    params: { userId },
  })
  return data
}