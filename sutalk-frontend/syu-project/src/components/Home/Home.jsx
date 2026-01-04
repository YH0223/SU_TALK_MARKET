// src/pages/Home/Home.jsx
import { useMemo, useRef, useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { FixedSizeList as List } from "react-window"
import "./Home.css"
import { MoonLoader } from "react-spinners"
import "../Loader/Loader.css"
import { usePosts } from "@/hooks/usePosts"
import { useAuthStore } from "@/stores/useAuthStore"
import { pickFirstPhotoPath, toAbs, toThumbAbs, createImageErrorHandler } from "@/utils/imageHelpers"
import PullToRefresh from "react-pull-to-refresh"

const Home = () => {
  const navigate = useNavigate()
  const {posts, loading, selectedCategory, sortOrder, setSelectedCategory, setSortOrder, getFilteredPosts,refetch } = usePosts(false)

  const { userId } = useAuthStore()
  const [hydrated, setHydrated] = useState(false)

  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get("q") || "").toLowerCase()

  const filterRef = useRef(null)
  const [listHeight, setListHeight] = useState(400)
  const TOPBAR_H = 56
  const BOTTOM_PAD = 0
  useEffect(() => {
    refetch(); // ✅ 초기 데이터 1회만 불러오기
  }, [refetch]);
  useEffect(() => {
    // ✅ Zustand persist 복원 완료 감지
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    return () => unsub()
  }, [])

  useEffect(() => {
    if (hydrated && !userId) {
      navigate("/enter", { replace: true });
    }
  }, [hydrated, userId, navigate]);
  useEffect(() => {
    console.log("🔹 userId:", userId, "hydrated:", hydrated)
  }, [userId, hydrated])

  useEffect(() => {
    const updateHeight = () => {
      const filterH = filterRef.current?.offsetHeight || 0
      const h = window.innerHeight - TOPBAR_H - BOTTOM_PAD - filterH - 24
      setListHeight(Math.max(240, h))
    }
    updateHeight()
    window.addEventListener("resize", updateHeight)
    return () => window.removeEventListener("resize", updateHeight)
  }, [])

  const highlightText = (text) => {
    if (!searchQuery || !text) return text
    const regex = new RegExp(`(${searchQuery})`, "gi")
    return text.split(regex).map((part, i) => (regex.test(part) ? <mark key={i}>{part}</mark> : part))
  }

  const filteredPosts = useMemo(
      () => getFilteredPosts(searchQuery),
      [getFilteredPosts, searchQuery,posts]
  )

  const categories = useMemo(() => ["전체", "전자제품", "가구", "의류", "도서", "생활용품", "스포츠/레저", "기타"], [])

  const handleClickPost = (postId) => {
    setTimeout(() => navigate(`/post/${postId}`), 300)
  }
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    refetch(); // ✅ posts 즉시 새로 불러오기
  };
  const Row = ({ index, style }) => {
    const post = filteredPosts[index]
    const originPath = pickFirstPhotoPath(post)
    const thumbUrl = originPath ? toThumbAbs(originPath) : "/assets/default-image.png"
    const originUrl = originPath ? toAbs(originPath) : "/assets/default-image.png"

    return (
      <div style={style}>
        <div className="home-PostCard" onClick={() => handleClickPost(post.itemid)}>
          <img
            loading="lazy"
            src={thumbUrl || "/placeholder.svg"}
            alt={post.title || "게시물"}
            onError={createImageErrorHandler(originUrl)}
          />
          <div className="home-PostDetails">
            <h3>{highlightText(post.title || "제목 없음")}</h3>
            <div className="post-meta">
              <span className="post-author">작성자: {post.sellerName}</span>
              <span className="post-date">{new Date(Number(post.regdate)).toLocaleDateString("ko-KR")}</span>
            </div>
            <p className="post-price">
              {typeof post.price === "number" ? `가격: ${post.price.toLocaleString()}원` : "가격 없음"}
            </p>
            <p className="post-comment">{highlightText(post.description || "설명 없음")}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="home-Container page-with-topbar">
      {loading && (
        <div className="loader-overlay">
          <MoonLoader color="#2670ff" size={40} />
        </div>
      )}

      <div className="filter-scroll-wrapper" ref={filterRef}>
        <div className="filter-scroll-row">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-button ${selectedCategory === category ? "active" : ""}`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
          {["최신순", "가격↑", "가격↓"].map((option) => (
            <button
              key={option}
              className={`filter-button ${sortOrder === option ? "active" : ""}`}
              onClick={() => setSortOrder(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ 여기서 PullToRefresh 래핑 */}
      <PullToRefresh
          onRefresh={async () => {
            await refetch();

            // ✅ 실제 존재하는 클래스 선택
            requestAnimationFrame(() => {
              const ptr = document.querySelector(".ptr");
              if (ptr) {
                ptr.style.transition = "transform 0.3s ease";
                ptr.style.transform = "translateY(0px)";
              }
            });
          }}
          pullDownThreshold={70}
          resistance={2.5}
      >
        <div className="home-Posts">
          {filteredPosts.length > 0 ? (
              <List
                  height={listHeight}
                  itemCount={filteredPosts.length}
                  itemSize={125}
                  width={"100%"}
              >
                {Row}
              </List>
          ) : (
              !loading && <p className="no-results">검색 결과가 없습니다</p>
          )}
        </div>
      </PullToRefresh>
    </div>
  )
}

export default Home
