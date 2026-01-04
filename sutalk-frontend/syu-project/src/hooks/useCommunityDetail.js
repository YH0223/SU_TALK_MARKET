import { useState, useEffect, useCallback } from "react";
import { getPostById, addCommentToPost, likePost } from "@/components/Community/community.api";
import {useAuthStore} from "@/stores/useAuthStore.js";
import { showToast } from "@/utils/toast";
/**
 * 커뮤니티 상세 페이지 로직을 관리하는 훅
 * - 상세 호출 1회에서 post + comments 모두 세팅
 * - 좋아요는 토글(낙관적 업데이트 → 서버 정정)
 */
export const useCommunityDetail = (postId) => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);

  // 게시글(+댓글) 불러오기: 단일 호출
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const p = await getPostById(postId);
        if (!mounted) return;
        setPost(p || null);
        setComments(Array.isArray(p?.comments) ? p.comments : []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [postId]);

  // 좋아요 토글 처리
  const handleLike = useCallback(async () => {
    if (isLiking || !post) return;

    const userId = useAuthStore.getState().userId;

    if (!userId) { showToast("error","로그인이 필요합니다."); return; }

    setIsLiking(true);

    const prevHasLiked = !!post.hasLiked;
    const prevLikes = Number(post.likes || 0);

    const nextHasLiked = !prevHasLiked;
    const nextLikes = prevLikes + (nextHasLiked ? 1 : -1);

    // 낙관적 반영
    setPost((prev) => prev ? ({
      ...prev,
      hasLiked: nextHasLiked,
      likes: Math.max(0, nextLikes),
    }) : prev);

    try {
      const { hasLiked, likes } = await likePost(postId);
      setPost((prev) => prev ? ({
        ...prev,
        hasLiked,
        likes: Math.max(0, likes),
      }) : prev);
    } catch (err) {
      // 실패 롤백
      console.error("좋아요 처리 실패:", err);
      showToast("error","좋아요 처리에 실패했습니다.");
      setPost((prev) => prev ? ({
        ...prev,
        hasLiked: prevHasLiked,
        likes: prevLikes,
      }) : prev);
    } finally {
      setIsLiking(false);
    }
  }, [isLiking, postId, post]);

  // 댓글 추가
  const addComment = useCallback(
    async (content) => {
      const currentUserId = useAuthStore.getState().userId;;
      if (!currentUserId) {
        showToast("info","댓글을 작성하려면 로그인이 필요합니다.");
        return false;
      }

      const tempId = `temp-${Date.now()}`;
      const optimistic = {
        id: tempId,
        author: "나",
        content,
        createdAt: new Date().toISOString(),
      };

      setComments((prev) => [optimistic, ...prev]);

      try {
        const saved = await addCommentToPost(postId, { content, authorId: currentUserId });
        setComments((prev) => prev.map((c) => (c.id === tempId ? saved : c)));
        // 필요 시 post의 commentsCount/댓글 수 갱신
        setPost((prev) => prev ? ({ ...prev, commentsCount: (prev.commentsCount ?? 0) + 1 }) : prev);
        return true;
      } catch (err) {
        setComments((prev) => prev.filter((c) => c.id !== tempId));
        showToast("error","댓글 등록에 실패했습니다.");
        console.error(err);
        return false;
      }
    },
    [postId],
  );

  return {
    post,
    comments,
    loading,
    isLiking,
    handleLike,
    addComment,
  };
};
