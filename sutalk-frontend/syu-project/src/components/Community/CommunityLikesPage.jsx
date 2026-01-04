import React, { useEffect, useState } from "react"
import axios from "@/api/axiosInstance"
import { useNavigate } from "react-router-dom"
import "./CommunityLikesPage.css"  // ✅ 새로 추가된 CSS
import {useAuthStore} from "@/stores/useAuthStore.js";

const CommunityLikesPage = () => {
  const [likedPosts, setLikedPosts] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const userId = useAuthStore.getState().userId;
        if (!userId) return
        const response = await axios.get(`/community/${userId}/likeList`)
        setLikedPosts(response.data)
      } catch (err) {
        console.error("커뮤니티 좋아요 불러오기 실패:", err)
      }
    }
    fetchLikedPosts()
  }, [])

  const handleCardClick = (postId) => {
    navigate(`/community/post/${postId}`)
  }

  return (
    <div className="community-likes-page">
      <h2>좋아요한 커뮤니티 글</h2>

      {likedPosts.length === 0 ? (
        <p className="community-likes-empty">좋아요한 게시글이 없습니다.</p>
      ) : (
        likedPosts.map((post) => (
          <div
            key={post.id}
            className="community-likes-card"
            onClick={() => handleCardClick(post.id)}
          >
            <h3 className="community-likes-title">{post.title}</h3>
            <p className="community-likes-content">{post.content}</p>

            <div className="community-likes-footer">
              <span>
                작성자: <b>{post.authorName || post.authorId}</b>
              </span>
              <div className="community-likes-meta">
                <span>❤️ {post.likes || 0}</span>
                <span>💬 {post.commentCount ?? 0}</span>
                <span className="community-likes-date">
                  🕒 {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default CommunityLikesPage
