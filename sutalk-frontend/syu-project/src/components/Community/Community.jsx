"use client"

// src/components/Community/Community.jsx
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import CommunityPostItem from "./CommunityPostItem.jsx"
import "./Community.css"
import { useCommunity } from "@/hooks/useCommunity"

const CATEGORIES = {
  hot: "인기",
  new: "최신",
  free: "자유",
  friendship: "친목",
  info: "정보",
  jobs: "구인/구직",
  hobby: "취미",
}

const Community = () => {
  const { loading, filter, setFilter, visiblePosts, canLoadMore, loadMore } = useCommunity()

  const [showSpinner, setShowSpinner] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const f = searchParams.get("filter")
    if (f && Object.keys(CATEGORIES).includes(f)) {
      setFilter(f)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let timer
    if (loading) timer = setTimeout(() => setShowSpinner(true), 120)
    else setShowSpinner(false)
    return () => clearTimeout(timer)
  }, [loading])

  useEffect(() => {
    if (searchParams.get("filter") !== filter) {
      setSearchParams({ filter })
    }
  }, [filter, searchParams, setSearchParams])

  return (
    <div className="community-wrap">
      {/* ✅ 커뮤니티 제목을 상단에 분리 */}
      <header className="community-header">
        <h2>커뮤니티</h2>
      </header>

      {/* ✅ 탭을 제목 아래로 이동 */}
      <div className="community-tabs">
        {Object.entries(CATEGORIES).map(([key, name]) => (
          <button
            key={key}
            className={filter === key ? "on" : ""}
            onClick={() => setFilter(key)}
          >
            {name}
          </button>
        ))}
      </div>

      {showSpinner ? (
        <div className="community-empty">불러오는 중…</div>
      ) : visiblePosts.length === 0 ? (
        <div className="community-empty">게시물이 없어요.</div>
      ) : (
        <>
          <ul className="community-list">
            {visiblePosts.map((p) => (
              <CommunityPostItem key={p.id} post={p} />
            ))}
          </ul>

          {canLoadMore && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "12px 0 72px",
              }}
            >
              <button onClick={loadMore} className="community-more">
                더보기
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Community
