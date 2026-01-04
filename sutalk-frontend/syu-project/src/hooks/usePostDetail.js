"use client"

import { useState, useEffect, useMemo } from "react"
import axios from "@/api/axiosInstance"
import { pickAllPhotoPaths } from "@/utils/imageHelpers"

/**
 * 게시글 상세 정보를 가져오고 관리하는 훅
 */
export const usePostDetail = (postId) => {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`/items/${postId}`)
        setPost(res.data)
        setError(null)
      } catch (err) {
        console.error("❌ 게시글 데이터 로딩 실패:", err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    if (postId) {
      fetchPost()
    }
  }, [postId])

  const imagePaths = useMemo(() => {
    const paths = pickAllPhotoPaths(post);
    return paths.length ? paths : ["/assets/default-image.png"];
  }, [post]);

    const formattedDate =
    post && /^\d+$/.test(String(post.regdate))
      ? new Date(Number(post.regdate)).toLocaleDateString("ko-KR")
      : (post?.regdate ?? "");

  return { post, loading, error, imagePaths, formattedDate };
};