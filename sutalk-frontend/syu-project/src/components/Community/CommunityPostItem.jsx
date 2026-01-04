"use client"

import React from "react"
import { useNavigate } from "react-router-dom"

const PostThumbnail = ({ src }) => (
  <div className="community-item-thumbnail">
    <img src={src} alt="" loading="lazy" />
  </div>
)

const CommunityPostItem = ({ post }) => {
  const navigate = useNavigate()

  // ✅ 백엔드에서 받은 데이터 중 썸네일로 사용할 이미지 URL을 지정합니다.
  const thumbnailUrl = post.thumbnailUrl || null

  const handleClick = () => {
    if (!post?.id) {
      console.warn("⚠️ 게시글 ID가 없습니다:", post)
      return
    }
    navigate(`/community/post/${post.id}`)
  }

  return (
    // ✅ 이미지가 있으면 'with-thumbnail' 클래스 추가
    <li
      className={`community-item ${thumbnailUrl ? "with-thumbnail" : ""}`}
      onClick={handleClick}
    >
      {/* ✅ 썸네일 URL이 있을 때만 PostThumbnail 렌더링 */}
      {thumbnailUrl && <PostThumbnail src={thumbnailUrl} />}

      {/* ✅ 기존 콘텐츠를 별도의 div로 묶어 flex 아이템으로 관리 */}
      <div className="community-item-content">
        <h3 className="community-item-title">{post.title}</h3>
        <div className="community-item-meta">
          <span className="author">{post.authorName || post.author}</span>
          <span className="date">
            {new Date(post.createdAt).toLocaleString("ko-KR")}
          </span>
        </div>
        <p className="community-item-snippet">
          {post.content?.slice(0, 80) || ""}
        </p>
        <div className="community-item-footer">
          <span className="like">♥ {post.likes ?? 0}</span>
          <span className="comment">💬 {post.commentsCount ?? 0}</span>
        </div>
      </div>
    </li>
  )
}

export default CommunityPostItem