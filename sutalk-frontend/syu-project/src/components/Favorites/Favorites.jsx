"use client";

import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { MoonLoader } from "react-spinners";
import "./Favorites.css";
import Nav from "../Nav/Nav";
import { useFavorites } from "@/hooks/useFavorites";
import {
  pickFirstPhotoPath,
  toAbs,
  toThumbAbs,
  createImageErrorHandler,
} from "@/utils/imageHelpers";

const Favorites = () => {
  const { favorites, loading, error } = useFavorites(true);
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="favorites-container">
        <p style={{ padding: "30px", fontWeight: "bold" }}>
          페이지 로딩 중 오류가 발생했습니다. 새로 고침해주세요.
        </p>
        <Nav />
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <header className="favorites-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          &lt;
        </button>
        <h2>관심 목록</h2>
      </header>

      {loading ? (
        <div className="loader-overlay">
          <MoonLoader color="#2670ff" size={40} />
        </div>
      ) : (
        <div className="favorites-list">
          {favorites.length > 0 ? (
            favorites.map((post) => {
              // 스토어가 post.itemImages로 정규화해서 줌
              const originPath = pickFirstPhotoPath({ itemImages: post.itemImages });
              const thumbUrl = originPath ? toThumbAbs(originPath) : "/assets/default-image.png";
              const originUrl = originPath ? toAbs(originPath) : "/assets/default-image.png";

              return (
                <Link to={`/post/${post.itemid}`} key={post.itemid} className="favorite-item">
                  <div className="favorite-thumbnail">
                    <img
                      loading="lazy"
                      src={thumbUrl || "/placeholder.svg"}
                      alt={post.title}
                      className="favorite-image"
                      onError={createImageErrorHandler(originUrl)}
                    />
                  </div>
                  <div className="favorite-details">
                    <h3>{post.title}</h3>
                    <p>
                      {post.price != null ? `${post.price.toLocaleString()}원` : "가격 정보 없음"}
                    </p>
                    <div className="favorite-like-count">
                      <FontAwesomeIcon icon={faHeart} style={{ color: "#f55", marginRight: 4 }} />
                      <span>{post.likeCount ?? 0}</span>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="no-favorites">관심 목록이 비어 있습니다.</p>
          )}
        </div>
      )}

      <Nav />
    </div>
  );
};

export default Favorites;
