import React, { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { useAuthStore } from "@/stores/useAuthStore";
import { useModalStore } from "@/stores/useModalStore";
import SellerReviewList from "../Review/SellerReviewList";
import { MoonLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import {showToast} from "../../utils/toast.js";

const ProfileModal = () => {
    // Zustand 상태를 "직접 읽지 말고"
    const closeProfile = useModalStore((state) => state.closeProfile);
    const [sellerId, setSellerId] = useState(null); // store로부터 복제해 보관

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const reporterId = useAuthStore.getState().userId;

    // ✅ Zustand 상태 변화를 수동 구독 (React 렌더에 연결되지 않음)
    useEffect(() => {
        const unsub = useModalStore.subscribe((state) => {
            if (state.isProfileOpen && state.profileSellerId) {
                setSellerId(state.profileSellerId);
            } else {
                setSellerId(null);
            }
        });
        return () => unsub();
    }, []);

    // ✅ sellerId가 바뀌면 fetch (React 상태로만 트리거)
    useEffect(() => {
        if (!sellerId) return;

        let cancelled = false;
        setLoading(true);
        const fetchAll = async () => {
            try {
                const [{ data: user }, { data: items }] = await Promise.all([
                    axios.get(`/users/${sellerId}`),
                    axios.get(`/items/by-seller`, { params: { sellerId } }),
                ]);
                if (!cancelled) {
                    setProfile(user);
                    setPosts(
                        Array.isArray(items)
                            ? items
                            : Array.isArray(items?.content)
                                ? items.content
                                : []
                    );
                }
            } catch (e) {
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchAll();
        return () => {
            cancelled = true;
        };
    }, [sellerId]);

    // ✅ 모달 닫기: Zustand의 값에 의존하지 않음
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("modal-overlay")) closeProfile();
    };

    if (!sellerId) return null;
    const handleFriendRequest = async () => {
        if (!sellerId) return;
        try {
            const res = await axios.post("/friends/request", null, {
                params: {
                    senderId: reporterId, // 현재 로그인한 사용자
                    receiverId: sellerId, // 모달 대상 사용자
                },
            });
            showToast("success",res.data || "친구 요청을 전송했습니다.");
        } catch (err) {
            console.error("❌ 친구 요청 실패:", err);
            const msg =
                err.response?.data?.message ||
                err.response?.data ||
                "친구 요청 중 오류가 발생했습니다.";
            showToast("error","요청 실패: " + msg);
        }
    };
    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div
                className="modal-content profile-container"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="modal-close" onClick={closeProfile}>
                    <FontAwesomeIcon icon={faXmark} />
                </button>

                {loading ? (
                    <div className="loader-overlay">
                        <MoonLoader color="#2670ff" size={40} />
                    </div>
                ) : error ? (
                    <p>판매자 정보를 불러올 수 없습니다.</p>
                ) : profile ? (
                    <>
                        <div className="profile-info">
                            <div className="profile-avatar">
                                <img
                                    src={profile.profileImage || "/default-image.png"}
                                    alt="프로필"
                                    className="avatar-icon"
                                    onError={(e) => {
                                        if (e.currentTarget.src !== "/default-image.png") {
                                            e.currentTarget.src = "/default-image.png"; // ✅ 한 번만 fallback
                                        }
                                    }}
                                />
                            </div>
                            <h3 className="profile-name">
                                {profile.name || profile.userid || sellerId}
                            </h3>
                            <p>
                                후기 평균 ⭐ {Number(profile.averageRating ?? 0).toFixed(1)} / 후기{" "}
                                {profile.reviewCount ?? 0}개
                            </p>
                            <button
                                className="edit-profile-button"
                                onClick={() =>
                                    window.open(
                                        `/report?reporterId=${reporterId}&reportedId=${sellerId}`,
                                        "_blank"
                                    )
                                }
                            >
                                🚨 신고하기
                            </button>
                            <button
                                className="edit-profile-button"
                                onClick={handleFriendRequest}
                            >
                                🤝 친구 추가
                            </button>
                        </div>

                        <div className="profile-reviews">
                            <SellerReviewList sellerId={sellerId} />
                        </div>

                        <div className="profile-posts">
                            <h4>🛒 작성한 게시글</h4>
                            {posts.length === 0 ? (
                                <p>작성한 게시글이 없습니다.</p>
                            ) : (
                                posts.map((post) => (
                                    <div key={post.itemid ?? post.id} className="profile-post-card">
                                        <Link to={`/post/${post.itemid ?? post.id}`}>
                                            <h5>{post.title}</h5>
                                            <p>{Number(post.price ?? 0).toLocaleString()}원</p>
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default ProfileModal;
