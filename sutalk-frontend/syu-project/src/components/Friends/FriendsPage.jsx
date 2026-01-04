"use client";

import { useState, useEffect } from "react";
import "./friends.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faSearch,
  faUserPlus,
  faCheck,
  faTimes,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import axios from "@/api/axiosInstance";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import {showToast} from "../../utils/toast.js";

export default function FriendsPage() {
  const navigate = useNavigate();
  const { userId } = useAuthStore();

  const [query, setQuery] = useState("");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("list");
  const [message, setMessage] = useState("");

  /** ✅ 친구 요청 보내기 */
  const handleFriendRequest = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      showToast("info","친구 아이디를 입력해주세요.");
      return;
    }
    try {
      const res = await axios.post("/friends/request", null, {
        params: { senderId: userId, receiverId: query.trim() },
      });
      setMessage(res.data || "친구 요청 전송 완료");
      setQuery("");
    } catch (err) {
      console.error("❌ 친구 요청 실패:", err);
      setMessage("요청 실패: " + (err.response?.data || "서버 오류"));
    }
  };

  /** ✅ 친구 목록 불러오기 */
  const loadFriends = async () => {
    try {
      const res = await axios.get(`/friends/${userId}/list`);
      const data = res.data;
      if (Array.isArray(data)) setFriends(data);
      else if (data?.friends) setFriends(data.friends);
      else setFriends([]);
    } catch (err) {
      console.error("❌ 친구 목록 불러오기 실패:", err);
      setFriends([]);
    }
  };

  /** ✅ 받은 요청 목록 불러오기 */
  const loadReceivedRequests = async () => {
    try {
      const res = await axios.get(`/friends/requests/received/${userId}`);
      const data = res.data;
      if (Array.isArray(data)) setRequests(data);
      else if (data?.requests) setRequests(data.requests);
      else setRequests([]);
    } catch (err) {
      console.error("❌ 받은 요청 목록 불러오기 실패:", err);
      setRequests([]);
    }
  };

  /** ✅ 요청 수락 */
  const handleAccept = async (requestId) => {
    try {
      await axios.post(`/friends/accept/${requestId}`);
      setMessage("친구 요청이 수락되었습니다.");
      await loadReceivedRequests();
      await loadFriends();
    } catch (err) {
      console.error("❌ 요청 수락 실패:", err);
    }
  };

  /** ✅ 요청 거절 */
  const handleReject = async (requestId) => {
    try {
      await axios.post(`/friends/reject/${requestId}`);
      setMessage("친구 요청이 거절되었습니다.");
      await loadReceivedRequests();
    } catch (err) {
      console.error("❌ 요청 거절 실패:", err);
    }
  };

  /** ✅ 친구 채팅 시작 (POST 요청 고정) */
  const handleChat = async (friend, e) => {
    e?.preventDefault(); // 혹시 버튼이 form 안에 있을 때 방지
    try {
      console.log("📡 채팅방 생성 요청:", {
        user1: userId,
        user2: friend.userid,
      });
      const res = await axios.post("/chat-rooms/friend/create", null, {
        params: { user1: userId, user2: friend.userid },
      });

      const room = res.data;
      console.log("✅ 응답:", room);

      if (room && room.chatroomId) {
        navigate(`/chat/${room.chatroomId}`);
      } else {
        showToast("error","채팅방 생성에 실패했습니다.");
      }
    } catch (err) {
      console.error("❌ 채팅방 생성 실패:", err);
      showToast("error","채팅방 생성 중 오류가 발생했습니다.");
    }
  };

  /** ✅ 탭 전환 시 데이터 갱신 */
  useEffect(() => {
    if (activeTab === "list") loadFriends();
    if (activeTab === "requests") loadReceivedRequests();
  }, [activeTab]);

  return (
    <div className="friends-container">
      {/* Header */}
      <div className="friends-header">
        <button className="back-button" onClick={() => window.history.back()}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <h2>친구</h2>
      </div>

      {/* Tab Navigation */}
      <div className="friend-tabs">
        <button
          className={activeTab === "list" ? "active" : ""}
          onClick={() => setActiveTab("list")}
        >
          친구 목록
        </button>
        <button
          className={activeTab === "requests" ? "active" : ""}
          onClick={() => setActiveTab("requests")}
        >
          받은 요청
        </button>
        <button
          className={activeTab === "send" ? "active" : ""}
          onClick={() => setActiveTab("send")}
        >
          친구 추가
        </button>
      </div>

      {/* 친구 추가 탭 */}
      {activeTab === "send" && (
        <div className="friend-search">
          <input
            type="text"
            placeholder="아이디로 친구 요청"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={handleFriendRequest}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
          {message && <p className="friend-message">{message}</p>}
        </div>
      )}

      {/* 친구 목록 */}
      {activeTab === "list" && (
        <div className="friends-list">
          {Array.isArray(friends) && friends.length > 0 ? (
            friends.map((f) => (
              <div key={f.friendId || f.userid} className="friend-item">
                <div className="friend-avatar">
                  <img
                    src={f.profileImage || "/default-image.png"}
                    alt="프로필"
                    onError={(e) => (e.target.src = "/default-image.png")}
                  />
                </div>
                <div className="friend-info">
                  <h3>{f.name || f.userid}</h3>
                  <button
                    className="chat-button"
                    onClick={(e) => handleChat(f, e)}
                  >
                    <FontAwesomeIcon icon={faCommentDots} /> 채팅하기
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-friends">친구 목록이 없습니다.</p>
          )}
        </div>
      )}

      {/* 받은 요청 목록 */}
      {activeTab === "requests" && (
        <div className="friends-list">
          {Array.isArray(requests) && requests.length > 0 ? (
            requests.map((req) => (
              <div key={req.id} className="friend-item">
                <div className="friend-avatar">
                  <img
                    src={req.sender?.profileImage || "/default-image.png"}
                    alt="프로필"
                  />
                </div>
                <div className="friend-info">
                  <h3>{req.sender?.name || req.sender?.userid}</h3>
                  <div className="friend-actions">
                    <button onClick={() => handleAccept(req.id)}>
                      <FontAwesomeIcon icon={faCheck} /> 수락
                    </button>
                    <button onClick={() => handleReject(req.id)}>
                      <FontAwesomeIcon icon={faTimes} /> 거절
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-friends">받은 요청이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
}
