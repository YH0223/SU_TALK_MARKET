// src/components/Profile/SellerProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import axios from "@/api/axiosInstance";
import { useAuthStore } from "@/stores/useAuthStore.js";

import SellerReviewList from "../Review/SellerReviewList";
import "./Profile.css";
import { FaArrowLeft } from "react-icons/fa";
import { MoonLoader } from "react-spinners";
import "../Loader/Loader.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const SellerProfile = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState(false);

  const reporterId = useAuthStore.getState().userId;

  const handleGoBack = () => {
    if (location.state?.from) navigate(location.state.from);
    else navigate(-1);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`/users/${sellerId}`);
        setProfile(data ?? null);

        // ✅ 이미지 URL 세팅 (캐시 무효화용 timestamp)
        const imageUrl = data?.profileImage
          ? `${data.profileImage}?t=${Date.now()}`
          : null;
        setProfileImage(imageUrl);
      } catch (error) {
        console.error("❌ 프로필 조회 실패:", error);
        setProfile(null);
        setError(true);
      }
    };

    const fetchPosts = async () => {
      try {
        const { data } = await axios.get(`/items/by-seller`, {
          params: { sellerId },
        });

        const normalized =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.content)
            ? data.content
            : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.result)
            ? data.result
            : [];

        setPosts(normalized);
      } catch (error) {
        console.error("❌ 게시글 조회 실패:", error);
        setPosts([]);
      }
    };

    (async () => {
      await Promise.all([fetchProfile(), fetchPosts()]);
      setLoading(false);
    })();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="loader-overlay">
        <MoonLoader color="#2670ff" size={40} />
      </div>
    );
  }

  if (!profile) return <p>판매자 정보를 찾을 수 없습니다.</p>;

  const safePosts = Array.isArray(posts) ? posts : [];

  // ✅ 이름 우선 표시
  const displayName = profile.name || profile.userid || sellerId;

  return (
    <div className="profile-container">
      <div className="profile-topbar">
        <button className="back-button" onClick={handleGoBack}>
          <FaArrowLeft className="back-icon" />
        </button>
        <h2 className="topbar-title">{displayName + "님의 프로필"}</h2>
      </div>

      <div className="profile-info">
        <div className="profile-avatar">
          {loading ? (
            <div className="avatar-placeholder">⏳</div>
          ) : profileImage && !error ? (
            <img
              src={profileImage}
              alt="프로필"
              className="avatar-icon"
              onError={() => setError(true)}
            />
          ) : (
            <FontAwesomeIcon icon={faUser} className="avatar-icon" />
          )}
        </div>

        <h3 className="profile-name">{displayName}</h3>
        <p>
          후기 평균 ⭐ {Number(profile.averageRating ?? 0).toFixed(1)} / 후기{" "}
          {profile.reviewCount ?? 0}개
        </p>

        <button
          className="edit-profile-button"
          onClick={() =>
            navigate("/report", {
              state: { reporterId, reportedId: sellerId, itemId: null },
            })
          }
        >
          🚨 신고하기
        </button>
      </div>

      <div className="profile-reviews">
        <SellerReviewList sellerId={sellerId} />
      </div>

      <div className="profile-posts">
        <h4>🛒 작성한 게시글</h4>
        {safePosts.length === 0 ? (
          <p>작성한 게시글이 없습니다.</p>
        ) : (
          safePosts.map((post) => (
            <div key={post.itemid ?? post.id} className="profile-post-card">
              <Link to={`/post/${post.itemid ?? post.id}`}>
                <h5>{post.title}</h5>
                <p>{Number(post.price ?? 0).toLocaleString()}원</p>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SellerProfile;
