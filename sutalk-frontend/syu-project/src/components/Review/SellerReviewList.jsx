import React, { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import "./SellerReviewList.css";

const SellerReviewList = ({ sellerId }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!sellerId) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`/reviews/seller/${sellerId}`);
        setReviews(res.data);
      } catch (err) {
        console.error("❌ 리뷰 조회 실패:", err);
      }
    };

    fetchData();
  }, [sellerId]);

  return (
    <div className="seller-review-container">
      <h3>📮 받은 후기</h3>
      {reviews.length === 0 ? (
        <p style={{ color: "#999", fontSize: "14px", marginLeft: "4px" }}>
          아직 후기가 없습니다.
        </p>
      ) : (
        reviews.map((review, idx) => (
          <div key={idx} className="review-box">
           <div className="review-header">
              <span>👤 {review.reviewerName}</span> {/* ✅ 여기! */}
              <span className="review-rating">⭐ {review.rating}</span>
            </div>

            <p className="review-item">📦 {review.itemTitle}</p>
            <p className="review-comment">💬 {review.comment}</p>
            <span className="review-date">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default SellerReviewList;
