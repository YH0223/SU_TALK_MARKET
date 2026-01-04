import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faReceipt, faUser, faCommentDots } from "@fortawesome/free-solid-svg-icons";
import SellerReviewList from "../Review/SellerReviewList";
import { useAuthStore } from "@/stores/useAuthStore";
import axios from "@/api/axiosInstance";
import { useEffect, useState } from "react";

const Profile = () => {
  const navigate = useNavigate();
  const { userId, name, updateName, logout } = useAuthStore(); // ✅ logout 추가
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ✅ 최신 프로필 정보 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const res = await axios.get(`/users/${userId}`);

        // ✅ 서버 응답에서 profileImage 받기
        const imageUrl = res.data.profileImage
          ? `${res.data.profileImage}?t=${Date.now()}` // ✅ 캐시 무효화
          : null;

        setProfileImage(imageUrl);

        // ✅ 이름이 변경된 경우 store에도 반영
        if (res.data.name) {
          updateName(res.data.name);
        }
      } catch (err) {
        console.error("❌ 프로필 정보 불러오기 실패:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, updateName]);

  // ✅ 로그아웃 처리 함수
  const handleLogout = () => {
    if (window.confirm("정말 로그아웃 하시겠습니까?")) {
      logout(); // Zustand store의 logout() 실행
      navigate("/login");
    }
  };

  return (
    <div className="profile-container">
      {/* 헤더 */}
      <header className="profile-header">
        <h2>나의 정보</h2>
      </header>

      {/* 프로필 카드 */}
      <div className="profile-info">
        <div className="profile-avatar">
          {loading ? (
            <div className="avatar-placeholder">⏳</div>
          ) : profileImage && !error ? (
            <img
              src={profileImage}
              alt="프로필"
              className="avatar-icon"
              onError={() => setError(true)} // ✅ 이미지 로드 실패 시 기본 아이콘
            />
          ) : (
            <FontAwesomeIcon icon={faUser} className="avatar-icon" />
          )}
        </div>

        {/* ✅ 이름 우선 표시, 없을 경우 userId 대체 */}
        <h3 className="profile-name">{name || userId}</h3>

        <Link to="/profile/edit">
          <button className="edit-profile-button">프로필 수정</button>
        </Link>

        {/* ✅ 로그아웃 버튼 추가 */}
        <button className="logout-button" onClick={handleLogout}>
          로그아웃
        </button>
      </div>

      {/* 메뉴 목록 */}
      <div className="profile-menu">
        <div className="menu-item">
          <Link to="/profile/favorites" className="menu-link">
            <FontAwesomeIcon icon={faHeart} className="menu-icon" />
            <span className="favorate-span">관심 목록</span>
          </Link>
          <span className="menu-arrow">〉</span>
        </div>

        <div className="menu-item">
          <Link to="/profile/community-likes" className="menu-link">
            <FontAwesomeIcon icon={faCommentDots} className="menu-icon" />
            <span className="community-span">커뮤니티 좋아요</span>
          </Link>
          <span className="menu-arrow">〉</span>
        </div>

        <div className="menu-item">
          <Link to="/profile/sales-history" className="menu-link">
            <FontAwesomeIcon icon={faReceipt} className="menu-icon" />
            <span className="sales-span">판매내역</span>
          </Link>
          <span className="menu-arrow">〉</span>
        </div>
      </div>

      {/* 후기 섹션 */}
      <div className="profile-reviews">
        <SellerReviewList sellerId={userId} />
      </div>
    </div>
  );
};

export default Profile;
