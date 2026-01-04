import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import "./SearchOverlay.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons"
import { useSearchHistory } from "@/hooks/useSearchHistory"
import { useNavigate } from "react-router-dom"

const API_BASE = import.meta.env.VITE_API_BASE_URL

export default function SearchOverlay({ isOpen, onClose }) {
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
        const query = await executeSearch(keyword || searchInput)
        if (query) {
            navigate(`/home?q=${encodeURIComponent(query)}`)
            clearSearchInput()
            onClose()
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* ✅ 반투명 배경 */}
                    <motion.div
                        className="search-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.45 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={onClose}
                    />

                    {/* ✅ TopBar 바로 아래 내려오는 슬라이드 */}
                    <motion.div
                        className="search-overlay"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                        <div className="search-bar">
                            <FontAwesomeIcon icon={faSearch} className="search-icon" />
                            <input
                                autoFocus
                                placeholder="검색어를 입력하세요"
                                value={searchInput}
                                onChange={(e) => {
                                    setSearchInput(e.target.value)
                                    executeSearch(e.target.value)
                                }}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                            <button className="close-btn" onClick={onClose}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        {/* ✅ 결과 리스트: 아래로 펼쳐지며 Fade-in */}
                        <motion.div
                            className="search-dropdown"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            {suggestions.length > 0 && (
                                <ul className="suggestion-list">
                                    {suggestions.map((item) => (
                                        <li
                                            key={item.itemId}
                                            className="suggestion-item"
                                            onClick={() => navigate(`/post/${item.itemId}`)}
                                        >
                                            <img
                                                src={
                                                    item.thumbnail
                                                        ? `${API_BASE}${item.thumbnail}`
                                                        : "/assets/default-image.png"
                                                }
                                                alt=""
                                                className="suggestion-thumb"
                                            />
                                            <span>{item.title}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {history.length > 0 && (
                                <div className="search-history">
                                    <div className="history-header">
                                        <span>최근 검색어</span>
                                        <button onClick={deleteAllHistory}>전체 삭제</button>
                                    </div>
                                    <ul className="history-list">
                                        {history.map((item) => (
                                            <li key={item.id} className="history-item">
                        <span
                            className="history-query"
                            onClick={() => handleSearch(item.query)}
                        >
                          {item.query}
                        </span>
                                                <button
                                                    className="history-delete"
                                                    onClick={() => deleteHistoryItem(item.query)}
                                                >
                                                    ×
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
