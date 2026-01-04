"use client"

import { useNavigate } from "react-router-dom"
import "./SalesHistory.css"
import { useSalesHistory } from "@/hooks/useSalesHistory"
import {
  toThumbAbs,
  toAbs,
  createImageErrorHandler,
  pickFirstPhotoPath,
} from "@/utils/imageHelpers"

function formatDate(regdate) {
  if (regdate == null) return ""
  const raw = typeof regdate === "string" ? regdate.trim() : regdate
  const num = Number(raw)
  if (!Number.isFinite(num)) return ""
  const ts = String(num).length === 10 ? num * 1000 : num
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ""
  return d.toLocaleDateString("ko-KR")
}

const getId = (item) => item.itemid ?? item.itemId ?? item.id

export default function SalesHistory() {
  const navigate = useNavigate()
  const { activeTab, setActiveTab, currentTabData, loading, changeStatus, deleteItem } =
    useSalesHistory()

  const handleEdit = (post) => {
    navigate(`/post/${getId(post)}/edit`, {
      state: { postData: { ...post, images: post.itemImages || [] } },
    })
  }

  return (
    <div className="sales-history-container">
      <header className="sales-history-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          &lt;
        </button>
        <h2>나의 판매 내역</h2>
      </header>

      <div className="tabs">
        {["판매중", "예약중", "거래완료"].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="sales-list">
        {loading ? (
          <div>로딩 중...</div>
        ) : currentTabData.length === 0 ? (
          <div className="empty">해당 상태의 판매 내역이 없습니다.</div>
        ) : (
          currentTabData.map((item) => {
            const id = getId(item)
            const originPath = pickFirstPhotoPath(item)
            const originUrl = originPath ? toAbs(originPath) : "/assets/default-image.png"
            const thumbUrl = originPath ? toThumbAbs(originPath) : "/assets/default-image.png"

            return (
              <div key={id} className="sales-item">
                <img
                  src={thumbUrl}
                  alt={item.title}
                  className="sales-image"
                  loading="lazy"
                  onError={createImageErrorHandler(originUrl)}
                />

                <div className="sales-details">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-price">
                    {typeof item.price === "number"
                      ? item.price.toLocaleString()
                      : item.price}
                    원
                  </p>
                  <p className="item-date">
                    {formatDate(item.regdate ?? item.createdAt ?? item.created_at)}
                  </p>

                  {activeTab === "판매중" && (
                    <>
                      <div className="actions">
                        <button className="edit-button" onClick={() => handleEdit(item)}>
                          ✏️
                        </button>
                        <button className="delete-button" onClick={() => deleteItem(id)}>
                          🗑️
                        </button>
                      </div>

                      <div className="status-buttons">
                        <button onClick={() => changeStatus(id, "예약중")}>예약중</button>
                        <button onClick={() => changeStatus(id, "거래완료")}>거래완료</button>
                      </div>
                    </>
                  )}

                  {activeTab === "예약중" && (
                    <div className="status-buttons">
                      <button onClick={() => changeStatus(id, "판매중")}>판매중</button>
                      <button onClick={() => changeStatus(id, "거래완료")}>거래완료</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
