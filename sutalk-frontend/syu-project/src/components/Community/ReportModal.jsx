import React, { useState } from 'react';
import './ReportModal.css'; // 모달용 CSS (아래 제공)
import { submitReport } from './community.api.js';
import {useAuthStore} from "@/stores/useAuthStore.js";
import {showToast} from "../../utils/toast.js";

const REPORT_REASONS = {
  SPAM: { title: "스팸 / 홍보 / 도배", desc: "관련 없는 상업적 광고, 악성 링크, 동일한 내용의 반복적인 게시 등" },
  ILLEGAL_INFO: { title: "불법 정보", desc: "법적으로 금지된 정보를 포함하는 경우 (음란물, 불법 도박, 마약 등)" },
  INSULT: { title: "욕설 / 비하 / 차별적 표현", desc: "심한 욕설, 타인에 대한 근거 없는 비방, 인종·성별·종교·지역 등에 대한 차별적 발언" },
  PERSONAL_INFO: { title: "개인정보 노출", desc: "타인의 동의 없이 이름, 연락처, 주소 등 개인정보를 게시한 경우" },
  COPYRIGHT: { title: "저작권 침해", desc: "뉴스 기사, 이미지, 영상, 창작물 등을 원작자의 허락 없이 무단으로 사용한 경우" },
  OTHER: { title: "기타", desc: "위 항목에 해당하지 않는 문제들을 사용자가 직접 입력할 수 있습니다." },
};

const ReportModal = ({ targetType, targetId, onClose }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUserId = useAuthStore.getState().userId;

    // ✅ FIX: currentUserId가 없는 경우(비로그인 상태) API 호출을 막습니다.
    if (!currentUserId) {
      showToast("error",'로그인이 필요한 기능입니다. 로그인 후 다시 시도해주세요.');
      // 필요하다면 여기서 로그인 페이지로 리디렉션할 수 있습니다.
      // window.location.href = '/login';
      return;
    }

    if (!reason) {
      showToast("error",'신고 사유를 선택해주세요.');
      return;
    }
    if (reason === 'OTHER' && !details.trim()) {
      showToast("error",'기타 사유를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ 백엔드의 ReportCreateRequest DTO 형식에 맞춰 데이터를 구성합니다.
      const reportData = {
        // TODO: 'some_user_id'는 실제 로그인된 사용자 ID로 교체해야 합니다.
        reporterId: currentUserId, 
        targetType: targetType.toUpperCase(), // 'post' -> 'POST'
        targetId: targetId,
        reason: reason,
        details: reason === 'OTHER' ? details : '',
      };

      // ✅ 통합된 API 함수를 호출합니다.
      await submitReport(reportData);

      showToast("success",'신고가 정상적으로 접수되었습니다.');
      onClose();
    } catch (error) {
      console.error('신고 처리 중 오류 발생:', error);
      showToast("error",'신고 접수 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>신고하기</h2>
        <form onSubmit={handleSubmit}>
          <ul className="report-reason-list">
            {Object.entries(REPORT_REASONS).map(([key, value]) => (
              <li key={key}>
                <label>
                  <input
                    type="radio"
                    name="reason"
                    value={key}
                    checked={reason === key}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <div className="reason-text">
                    <strong>{value.title}</strong>
                    <p>{value.desc}</p>
                  </div>
                </label>
              </li>
            ))}
          </ul>
          {reason === 'OTHER' && (
            <textarea
              className="report-details-input"
              rows="4"
              placeholder="상세한 신고 사유를 입력해주세요."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          )}
          <div className="report-modal-actions">
            <button type="button" onClick={onClose} className="secondary" disabled={isSubmitting}>취소</button>
            <button type="submit" className="primary" disabled={isSubmitting}>
              {isSubmitting ? '접수 중...' : '신고 접수'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
