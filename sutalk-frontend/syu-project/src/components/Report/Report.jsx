import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "@/api/axiosInstance";
import "./Report.css";
import {showToast} from "../../utils/toast.js";

const Report = () => {
  const [selectedReason, setSelectedReason] = useState("");
  const [additionalText, setAdditionalText] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 전달받은 신고 정보
  const { reporterId, targetType, targetId } = location.state || {};

  // ✅ 신고 사유 매핑 (백엔드 Enum과 일치)
  const REASON_MAP = {
    "사기": "FRAUD",
    "욕설": "ABUSE",
    "거래 게시글이 아닙니다.": "NOT_TRADE",
    "기타 부적절한 행위": "OTHER",
  };

  // ✅ 신고 제출
  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ 브라우저 기본 제출 막기

    if (!selectedReason) {
      showToast("info","신고 사유를 선택해주세요.");
      return;
    }

    const mappedReason = REASON_MAP[selectedReason] || "OTHER";
    const details =
      selectedReason === "기타 부적절한 행위" ? additionalText : "";

    const payload = {
      reporterId,
      targetType, // e.g. "ITEM", "POST", "COMMENT"
      targetId,
      reason: mappedReason,
      details,
    };

    console.log("📤 신고 요청:", payload);

    try {
      await axios.post("/reports/submit", payload);
      showToast("success","신고가 접수되었습니다.");
      navigate(-1);
    } catch (error) {
      console.error("❌ 신고 실패:", error);
      showToast("error","신고 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="report-container">
      {/* 상단 헤더 */}
      <header className="report-header">
        <button className="close-button" onClick={() => navigate(-1)}>
          &lt;
        </button>
        <h3>신고하기</h3>
      </header>

      {/* 신고 내용 */}
      <div className="report-content">
        <p>신고하는 사유를 선택해주세요.</p>

        {/* ✅ form → div로 변경 (기본 제출 방지) */}
        <div className="report-form">
          {["사기", "욕설", "거래 게시글이 아닙니다.", "기타 부적절한 행위"].map(
            (reason) => (
              <label key={reason}>
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                />
                {reason}
              </label>
            )
          )}

          {selectedReason === "기타 부적절한 행위" && (
            <textarea
              placeholder="입력하세요."
              value={additionalText}
              onChange={(e) => setAdditionalText(e.target.value)}
            />
          )}
        </div>

        {/* ✅ 기본 submit → button type="button" 으로 변경 */}
        <button
          type="button"
          className="submit-button"
          onClick={handleSubmit}
        >
          제출
        </button>
      </div>
    </div>
  );
};

export default Report;
