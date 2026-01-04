  import { useParams, useNavigate} from "react-router-dom";
import React, { useState } from "react";
import "./PostDetail.css";
import TopBar from "../TopBar/TopBar";
import BottomBar from "../BottomBar/BottomBar";
import { MoonLoader } from "react-spinners";
import "../Loader/Loader.css";
import { usePostDetail } from "@/hooks/usePostDetail";
import { useImageSlider } from "@/hooks/useImageSlider";
import { handleImgError } from "@/utils/imageHelpers"; // toThumbAbs 사용 X
import KakaoMapPicker from "@/components/KakaoMap/KakaoMapPicker";
import { useModalStore } from "@/stores/useModalStore";
import { showToast } from "@/utils/toast";
// ✅ 기본 이미지 상수
const DEFAULT_IMG = "/default-image.png";
const DEFAULT_PROFILE = "/default-image.png";


const PostDetail = () => {
  const { postId } = useParams();
  const { openProfile } = useModalStore();
  const [isMapOpen, setIsMapOpen] = useState(false);

  const { post, loading, imagePaths, formattedDate } = usePostDetail(postId || "");

  // post 수신 후 파생값 계산
  const safePostId = postId ?? (post?.itemid != null ? String(post.itemid) : "");

  // 이미지가 없으면 기본 이미지 한 장만 표시
  const safeImages =
    Array.isArray(imagePaths) && imagePaths.length > 0 ? imagePaths : [DEFAULT_IMG];

  const {
    currentImageIndex,
    prevImageIndex,
    nextImage,
    prevImage,
    goToImage,
  } = useImageSlider(safeImages.length);

  const hasMultiple = safeImages.length > 1;

  return (
    <div className="post-detail-container">
      {loading && (
        <div className="loader-overlay">
          <MoonLoader color="#2670ff" size={40} />
        </div>
      )}

      {!loading && post && (
        <>
          <TopBar />

          {/* ✅ 이미지 슬라이더 */}
          <div className="image-slider">
            <img
              src={safeImages[prevImageIndex]}
              className="slider-image fade-out"
              alt="이전 이미지"
              key={`prev-${prevImageIndex}`}
              onError={(e) => handleImgError(e)} // 실패 시 기본 이미지
              loading="lazy"
            />
            <img
              src={safeImages[currentImageIndex]}
              className="slider-image fade-in"
              alt="현재 이미지"
              key={`current-${currentImageIndex}`}
              onError={(e) => handleImgError(e)}
              loading="lazy"
            />

            {hasMultiple && (
              <>
                <button className="slider-button left" onClick={prevImage}>
                  &lt;
                </button>
                <button className="slider-button right" onClick={nextImage}>
                  &gt;
                </button>
              </>
            )}
          </div>

          {/* ✅ 인디케이터 (점 표시) */}
          {hasMultiple && (
            <div className="indicator-dots">
              {safeImages.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === currentImageIndex ? "active" : ""}`}
                  onClick={() => goToImage(index)}
                />
              ))}
            </div>
          )}

          {/* ✅ 게시글 상세 정보 */}
          <div className="comment-container">
            <h1>{post.title}</h1>
            <div className="category-tag">{post.category}</div>

            {/* ✅ 판매자 정보 (프로필 + 이름) */}
            <div className="seller-info">
              <span className="seller-label">판매자:</span>
              <div
                className="seller-profile"
                onClick={() => openProfile(post.sellerId)}
              >
                <img
                  src={post.sellerProfileImage || DEFAULT_PROFILE}
                  alt={`${post.sellerName || "판매자"}의 프로필`}
                  className="seller-avatar"
                  // ✅ 무한루프 방지 처리
                  onError={(e) => {
                    e.target.onerror = null; // ⚡ 한 번만 실행
                    e.target.src = DEFAULT_PROFILE;
                  }}
                />
                <span className="seller-name">
                  {post.sellerName || `${post.sellerId?.slice(-3)}`}
                </span>
              </div>
            </div>

            {/* 설명 */}
            <p className="description-text">{post.description}</p>

            {/* 거래 위치 + 등록일 */}
            <div className="info-row">
              <span>📍 {post.meetLocation}</span>
              <span>🕒 {formattedDate}</span>
            </div>

            {/* ✅ 지도 토글 버튼 */}
            <div
                className="map-toggle"
                onClick={() => setIsMapOpen((prev) => !prev)}
            >
              {isMapOpen ? "지도 닫기 ▲" : "지도 보기 ▼"}
            </div>

            {/* ✅ KakaoMapPicker 삽입 */}
            <div className={`map-container ${isMapOpen ? "open" : ""}`}>
              {isMapOpen && (
                  <KakaoMapPicker
                      onSelect={() => {}} // 읽기 전용용 → 선택 무시
                  />
              )}
            </div>
          </div>

          {/* ✅ 하단 바 */}
          {safePostId && (
            <BottomBar
              postId={safePostId}
              price={post.price}
              sellerId={post.sellerId}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PostDetail;
