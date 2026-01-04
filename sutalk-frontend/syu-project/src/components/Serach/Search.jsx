"use client"
import { Link, useNavigate } from "react-router-dom"
import "./Search.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft, faClock, faSearch } from "@fortawesome/free-solid-svg-icons"
import { useSearchHistory } from "@/hooks/useSearchHistory"

const API_BASE = import.meta.env.VITE_API_BASE_URL

const Search = () => {
  const navigate = useNavigate()

  const {
    history,
    searchInput,
    setSearchInput,
    suggestions,
    executeSearch,
    deleteHistoryItem,
    deleteAllHistory,
    clearSearchInput,
  } = useSearchHistory()

  const handleSearch = async (keyword) => {
    const query = await executeSearch(keyword)
    if (query) {
      navigate(`/home?q=${encodeURIComponent(query)}`)
      clearSearchInput()
    }
  }

  return (
    <div className="search-container">
      <div className="header">
        <Link to="/home">
          <button className="search-back-button">
            <FontAwesomeIcon icon={faChevronLeft} className="search-back-image" />
          </button>
        </Link>

        <div className="search-bar-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="원하는 물건을 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="search-btn" onClick={() => handleSearch()}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </div>

      {/* ✅ 추천 검색어 */}
      {suggestions.length > 0 && (
        <ul className="suggestion-list">
          {suggestions.map((item) => (
            <li
              key={item.itemId}
              className="suggestion-item with-image"
              onClick={() => navigate(`/post/${item.itemId}`)}
            >
              <img
                src={
                  item.thumbnail
                    ? `${API_BASE}${item.thumbnail.startsWith("/") ? item.thumbnail : `/uploads/${item.thumbnail}`}`
                    : "/assets/default-image.png"
                }
                alt="썸네일"
                className="suggestion-thumb"
                onError={(e) => {
                  if (!e.target.src.endsWith("/assets/default-image.png")) {
                    e.target.onerror = null
                    e.target.src = "/assets/default-image.png"
                  }
                }}
                loading="lazy"
              />
              <span className="suggestion-title">{item.title}</span>
            </li>
          ))}
        </ul>
      )}

      {/* ✅ 검색 기록 */}
      <div className="history-container">
        <div className="history-header">
          <h3>검색 기록</h3>
          {history.length > 0 && (
            <button className="delete-all-button" onClick={deleteAllHistory}>
              전체 삭제
            </button>
          )}
        </div>

        <ul>
          {history.length > 0 ? (
            history.map((item) => (
              <li key={item.id} className="history-item">
                <FontAwesomeIcon icon={faClock} className="search-marker-image" />
                <span className="history-query" onClick={() => handleSearch(item.query)}>
                  {item.query}
                </span>
                <button className="Sdelete-button" onClick={() => deleteHistoryItem(item.query)}>
                  ×
                </button>
              </li>
            ))
          ) : (
            <li>검색 기록이 없습니다.</li>
          )}
        </ul>
      </div>
    </div>
  )
}

export default Search
