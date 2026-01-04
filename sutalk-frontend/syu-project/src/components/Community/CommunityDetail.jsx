"use client"

import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "./Community.css"
import ReportModal from "./ReportModal"
import { useCommunityDetail } from "@/hooks/useCommunityDetail"
import { useImageSlider } from "@/hooks/useImageSlider"
import { useModalStore } from "@/stores/useModalStore"   
import { useAuthStore } from "@/stores/useAuthStore" 
import { deletePost, deleteComment } from "./community.api"
import {showToast} from "../../utils/toast.js";

const DEFAULT_PROFILE = "/default-image.png"

const CommunityDetail = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const [commentText, setCommentText] = useState("")
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportTarget, setReportTarget] = useState({ type: "", id: null })
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState(null)

  const { post, comments, loading, isLiking, handleLike, addComment } =
      useCommunityDetail(postId)
  const { openProfile } = useModalStore()   // ✅ 프로필 모달 열기 함수
  const { userId: loggedInUserId } = useAuthStore() // 현재 로그인한 사용자 ID
  const isMyPost = post && post.authorId === loggedInUserId // 내 글인지 여부

  const hasImages = post?.images && post.images.length > 0
  const {
    currentImageIndex,
    prevImageIndex,
    nextImage,
    prevImage,
    goToImage,
  } = useImageSlider(hasImages ? post.images.length : 0)
  const hasMultipleImages = hasImages && post.images.length > 1

  const openReportModal = (type, id) => {
    setReportTarget({ type, id })
    setIsReportModalOpen(true)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const text = commentText.trim()
    if (!text) return
    const success = await addComment(text)
    if (success) setCommentText("")
  }

  const handleDelete = async () => {
    if (!isMyPost || isDeleting) return

    // 사용자에게 재확인
    if (window.confirm("정말로 이 글을 삭제하시겠습니까?")) {
      setIsDeleting(true)
      try {
        await deletePost(postId)
        showToast("success","게시글이 삭제되었습니다.")
        navigate("/community") // 삭제 후 커뮤니티 목록으로 이동
      } catch (error) {
        console.error("Failed to delete post:", error)
        if (error.response?.status === 403) {
          showToast("error","삭제 권한이 없습니다.")
        } else {
          showToast("error","삭제 중 오류가 발생했습니다.")
        }
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleDeleteComment = async (commentId) => {
    // 다른 댓글/게시글 삭제 작업이 진행 중이면 중복 실행 방지
    if (isDeleting || deletingCommentId) return

    if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      setDeletingCommentId(commentId) // 삭제 시작
      try {
        await deleteComment(commentId)
        showToast("success", "댓글이 삭제되었습니다.")
        // ✅ 중요: 데이터 불일치를 피하기 위해 페이지를 새로고침하여 최신 댓글 목록을 불러옵니다.
        // (useCommunityDetail 훅에 refetch 기능이 있다면 그것을 호출하는 것이 더 좋습니다.)
        window.location.reload()
      } catch (error) {
        console.error("Failed to delete comment:", error)
        if (error.response?.status === 403) {
          showToast("error","댓글 삭제 권한이 없습니다.")
        } else {
          showToast("error","댓글 삭제 중 오류가 발생했습니다.")
        }
      } finally {
        setDeletingCommentId(null) // 삭제 완료
      }
    }
  }

  if (loading) return <div className="community-empty">불러오는 중…</div>
  if (!post) return <div className="community-empty">해당 글을 찾을 수 없어요.</div>

  return (
      <div className="community-wrap">
        <header className="community-header">
          <h2>커뮤니티</h2>
          <button className="ghost small" onClick={() => navigate(-1)}>
            ← 뒤로
          </button>
        </header>

        <article className="community-detail">
          {hasImages && (
              <div className="community-image-slider">
                <img
                    src={post.images[prevImageIndex]}
                    className="community-image-slider__image fade-out"
                    alt="이전 이미지"
                    key={`prev-${prevImageIndex}`}
                />
                <img
                    src={post.images[currentImageIndex]}
                    className="community-image-slider__image fade-in"
                    alt="현재 이미지"
                    key={`current-${currentImageIndex}`}
                />
                {hasMultipleImages && (
                    <>
                      <button
                          className="community-image-slider__button left"
                          onClick={prevImage}
                      >
                        &lt;
                      </button>
                      <button
                          className="community-image-slider__button right"
                          onClick={nextImage}
                      >
                        &gt;
                      </button>
                      <div className="community-image-slider__indicator">
                        {post.images.map((_, index) => (
                            <span
                                key={index}
                                className={`community-image-slider__dot ${
                                    index === currentImageIndex ? "active" : ""
                                }`}
                                onClick={() => goToImage(index)}
                            />
                        ))}
                      </div>
                    </>
                )}
              </div>
          )}

          <div className="community-detail-header">
            <h3 className="community-detail-title">{post.title}</h3>
          {/* ✅ 버튼 래퍼 */}
          <div className="community-detail-actions">
            {/* ✅ 내 글인 경우에만 삭제 버튼 노출 */}
            {isMyPost && (
              <button
                className="delete-button"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            )}
            <button
              className="report-button"
              onClick={() => openReportModal("post", post.id)}
            >
              신고
            </button>
          </div>
        </div>

          {/* ✅ 작성자 프로필 클릭 시 ProfileModal 열기 */}
          <div className="community-detail-meta">
            <div className="author-info">
              <img
                  src={post.authorProfileImage || DEFAULT_PROFILE}
                  alt={`${post.author || "작성자"}의 프로필`}
                  className="author-avatar"
                  onClick={() => openProfile(post.authorId)}
                  onError={(e) => (e.target.src = DEFAULT_PROFILE)}
                  style={{ cursor: "pointer" }}
              />
              <span>{post.author || "익명"}</span>
            </div>

            <span>
            {(post.createdAt || "").slice(0, 16).replace("T", " ")}
          </span>

            <button
                className="like-button"
                onClick={handleLike}
                disabled={isLiking}
            >
              ❤️ {post.likes ?? 0}
            </button>
            <span className="comment">💬 {post.comments?.length ?? 0}</span>
          </div>

          <div
              className="community-detail-content"
              style={{ whiteSpace: "pre-wrap" }}
          >
            {post.content}
          </div>
        </article>

        {/* ✅ 댓글 목록 */}
        <section className="comment-section">
          <h4 className="comment-title">댓글 {comments.length}</h4>

          <form className="comment-form" onSubmit={onSubmit}>
            <input
                type="text"
                placeholder="댓글을 입력하세요"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" disabled={!commentText.trim()}>
              등록
            </button>
          </form>

      <ul className="comment-list">
          {comments.map((c) => {
            // ✅ 추가: 이 댓글이 내 댓글인지 확인
            const isMyComment = loggedInUserId === c.authorId
            return (
              <li key={c.id} className="comment-item">
                {/* ✅ 수정: 댓글 메타 (버튼 그룹 추가) */}
                <div className="comment-meta">
                  <img
                    src={c.authorProfileImage || DEFAULT_PROFILE}
                    alt={`${c.author || "익명"}의 프로필`}
                    className="comment-avatar"
                    onClick={() => openProfile(c.authorId)}
                    onError={(e) => (e.target.src = DEFAULT_PROFILE)}
                    style={{ cursor: "pointer" }}
                  />
                  <strong>{c.author || "익명"}</strong>

                  {/* ✅ 추가: 댓글 버튼 그룹 (오른쪽 정렬) */}
                  <div className="comment-actions">
                    {/* ✅ 내 댓글인 경우 삭제 버튼 노출 */}
                    {isMyComment && (
                      <button
                        className="delete-button small"
                        onClick={() => handleDeleteComment(c.id)}
                        // ✅ 삭제 중인 ID와 일치하거나, 다른 작업이 진행 중일 때 비활성화
                        disabled={deletingCommentId !== null || isDeleting}
                      >
                        {deletingCommentId === c.id ? "삭제 중..." : "삭제"}
                      </button>
                    )}
                    <button
                      className="report-button"
                      onClick={() => openReportModal("comment", c.id)}
                    >
                      신고
                    </button>
                  </div>
                </div>
                <p className="comment-text">{c.content}</p>
              </li>
            )
          })}
        </ul>        
        </section>

        {/* ✅ 신고 모달 */}
        {isReportModalOpen && (
            <ReportModal
                targetType={reportTarget.type}
                targetId={reportTarget.id}
                onClose={() => setIsReportModalOpen(false)}
            />
        )}
      </div>
  )
}

export default CommunityDetail
