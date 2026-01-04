import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "@/api/axiosInstance";

import "./Review.css";
import {showToast} from "../../utils/toast.js";

const Review = () => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [sellerProfile, setSellerProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { itemId, buyerId, sellerId, transactionId } = location.state || {};

  // ✅ 판매자 프로필 조회
  useEffect(() => {
    if (sellerId) {
      axios
        .get(`/users/${sellerId}`)
        .then((res) => setSellerProfile(res.data))
        .catch((err) => console.error("❌ 판매자 정보 조회 실패:", err));
    }
  }, [sellerId]);

  const handleRating = (index) => setRating(index + 1);

  const handleComplete = async () => {
    if (!rating || !reviewText.trim()) {
      return showToast("error","별점과 내용을 모두 작성해주세요.");
    }

    try {
      await axios.post("/reviews", {
        itemId,
        buyerId,
        revieweeId: sellerId,
        transactionId,
        rating,
        comment: reviewText,
      });
      showToast("success","리뷰가 저장되었습니다!");
      navigate(-1);
    } catch (err) {
      console.error("❌ 리뷰 저장 오류:", err);
      showToast("error","리뷰 저장에 실패했습니다.");
    }
  };

  const handleReport = () => {
    if (!buyerId || !sellerId || !itemId) {
      showToast("error","신고 대상 정보가 부족합니다.");
      return;
    }

    navigate("/report", {
      state: {
        reporterId: buyerId,
        reportedId: sellerId,
        itemId,
      },
    });
  };

  // ✅ 이름 우선 표시 (없으면 userid fallback)
  const sellerDisplayName =
    sellerProfile?.name || sellerProfile?.userid || `user-${sellerId?.slice(-3)}`;

  return (
    <div className="review-container">
      <header className="review-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          &lt;
        </button>
        <h3>리뷰하기</h3>
        <button className="report-button" onClick={handleReport}>
          신고
        </button>
      </header>

      <div className="review-content">
        <div className="profile-avatar">
          <img
            loading="lazy"
            src={sellerProfile?.profileImage || "/assets/수야.png"} // ✅ 실제 프로필 이미지 반영
            alt="프로필 이미지"
            className="profile-image"
          />
        </div>

        <h3 className="profile-name">{sellerDisplayName}</h3>

        <div className="stars">
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              className={`star ${index < rating ? "filled" : ""}`}
              onClick={() => handleRating(index)}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          className="review-textarea"
          placeholder="리뷰 내용을 작성해주세요."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        ></textarea>

        <button className="complete-button" onClick={handleComplete}>
          완료
        </button>
      </div>
    </div>
  );
};

export default Review;
