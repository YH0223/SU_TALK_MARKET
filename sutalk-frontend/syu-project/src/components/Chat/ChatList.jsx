import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import "./Chat.css";
import "../Loader/Loader.css";
import axios from "@/api/axiosInstance";
import { useAuthStore } from "@/stores/useAuthStore.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://sutalkmarket.shop:8080";

/** 첫 이미지 경로 뽑기 (.itemImages 등 혼용 대응) */
function pickFirstPhotoPath(chat) {
  const arr = chat?.itemImages ?? chat?.images ?? chat?.photos ?? [];
  const first = Array.isArray(arr) ? arr[0] : arr;
  if (!first) return null;
  if (typeof first === "string") return first;
  if (typeof first === "object")
    return first.photoPath || first.url || first.path || first.src || null;
  return null;
}

/** 절대경로 변환 */
function toAbs(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

/** 썸네일 경로 (/uploads 파일명 기반) */
function toThumbAbs(originPath) {
  if (!originPath) return "";
  const file = originPath.split("/").pop();
  return `${API_BASE}/uploads/thumbnails/thumb_${file}`;
}

/** 첫 truthy 반환 */
function firstOf(...xs) {
  for (const x of xs) if (x) return x;
  return null;
}

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileCache, setProfileCache] = useState({});
  const senderId = useAuthStore.getState().userId;

  const fetchChats = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await axios.get(`/chat-rooms`, { params: { userId: senderId } });
      const list = Array.isArray(res.data) ? res.data : [];
      setChats(list);
    } catch (err) {
      console.error("❌ 채팅 목록 오류:", err);
      setChats([]);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    if (!senderId) return;
    fetchChats(true);
    const intervalId = setInterval(() => fetchChats(false), 10000);
    return () => clearInterval(intervalId);
  }, [senderId]);

  const friendOpponentIds = useMemo(() => {
    const ids = new Set();
    for (const c of chats) {
      const isFriend = c?.roomType === "FRIEND" || c?.itemId == null;
      if (!isFriend) continue;
      const opp = senderId === c?.sellerId ? c?.buyerId : c?.sellerId;
      if (opp) ids.add(opp);
    }
    return Array.from(ids);
  }, [chats, senderId]);

  useEffect(() => {
    let cancelled = false;
    const need = friendOpponentIds.filter((id) => id && !profileCache[id]);
    if (need.length === 0) return;

    (async () => {
      const next = {};
      for (const id of need) {
        try {
          const { data } = await axios.get(`/users/${id}`);
          const raw = data?.profileImage;
          next[id] = raw ? toAbs(raw) : "/assets/default-image.png";
        } catch {
          next[id] = "/assets/default-image.png";
        }
      }
      if (!cancelled) setProfileCache((prev) => ({ ...prev, ...next }));
    })();

    return () => { cancelled = true; };
  }, [friendOpponentIds, profileCache]);

  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    if (Number.isNaN(d.getTime())) return "";
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "오후" : "오전";
    const h12 = h % 12 || 12;
    return `${ampm} ${h12}:${m}`;
  };

  return (
    <>
      {loading && (
        <div className="loader-overlay">
          <MoonLoader color="#2670ff" size={40} />
        </div>
      )}

      <div className="chat-page chat-list-page">
        <header className="chatlist-header">
          <h1 className="chatlist-title">채팅</h1>
        </header>

        <div className="chat-list-container">
          <div className="chat-items" style={{ minHeight: 200 }}>
            {!loading && chats.length === 0 && (
              <p style={{ padding: "1rem" }}>채팅방이 없습니다</p>
            )}

            {!loading &&
              chats
                .filter((chat) => chat && chat.chatroomId)
                .map((chat, idx) => {
                  const chatroomId = chat.chatroomId;

                  // 거래/친구 판별
                  const isTradeRoom =
                    chat?.roomType === "TRADE" ||
                    (typeof chat?.itemId === "number" && !Number.isNaN(chat.itemId));

                  // 파라미터
                  const itemId = chat.itemId ?? "";
                  const sellerId = chat.sellerId ?? "";
                  const search = `?itemId=${encodeURIComponent(itemId)}&sellerId=${encodeURIComponent(sellerId)}`;

                  // ===== 이미지 결정 =====
                  let displayImage = "/assets/default-image.png";
                  if (isTradeRoom) {
                    // ✅ 원본 우선(main) → 썸네일(thumb) → 기본
                    const origin = firstOf(
                      pickFirstPhotoPath(chat),
                      chat.thumbnail,
                      chat.item?.thumbnail
                    );
                    const main = origin ? toAbs(origin) : null;
                    const thumb = origin ? toThumbAbs(origin) : null;

                    // 원본 먼저 사용
                    displayImage = main || thumb || "/assets/default-image.png";

                    // onError에서 썸네일/기본으로 폴백하기 위해 data-*로 보관
                    // (React에서는 data-* 사용 가능)
                  } else {
                    // 친구방: 상대 프로필
                    const opponentId = senderId === chat?.sellerId ? chat?.buyerId : chat?.sellerId;
                    displayImage = profileCache[opponentId] || "/assets/default-image.png";
                  }

                  // ===== 제목 =====
                  const friendName =
                    chat.opponentName ||
                    chat.friendName ||
                    (senderId === chat?.sellerId ? chat?.buyerUsername : chat?.sellerUsername) ||
                    "상대방";
                  const displayTitle = isTradeRoom
                    ? (chat.itemTitle || chat.title || "상품명 없음")
                    : friendName;

                  // 보조 정보
                  const sellerUsername =
                    chat.sellerUsername?.trim() || sellerId || "상대방";

                  // 원본/썸네일 재계산 (onError 폴백에 사용)
                  const origin = firstOf(
                    pickFirstPhotoPath(chat),
                    chat.thumbnail,
                    chat.item?.thumbnail
                  );
                  const main = origin ? toAbs(origin) : null;
                  const thumb = origin ? toThumbAbs(origin) : null;
                  const fallbackTrade = thumb || "/assets/default-image.png";

                  return (
                    <Link
                      key={chatroomId || idx}
                      to={`/chat/${chatroomId}${search}`}
                      state={{ itemId, sellerId }}
                      className="chat-item"
                    >
                      <img
                        src={displayImage}
                        alt="thumbnail"
                        className="chat-thumbnail"
                        data-fallback-trade={fallbackTrade}
                        onError={(e) => {
                          if (isTradeRoom) {
                            // 원본이 실패 → 썸네일 시도 → 기본
                            const next = e.currentTarget.getAttribute("data-fallback-trade");
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = next || "/assets/default-image.png";
                          } else {
                            e.currentTarget.src = "/assets/default-image.png";
                          }
                        }}
                      />
                      <div className="chat-info">
                        <h3>{displayTitle}</h3>
                        <p>{sellerUsername}</p>
                        <p>{chat.meetLocation || ""}</p>
                      </div>
                      <span className="chat-time">{formatTime(chat.createdAt)}</span>
                    </Link>
                  );
                })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatList;
