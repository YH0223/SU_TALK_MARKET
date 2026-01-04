import React, { useState } from "react"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import SearchOverlay from "@/components/Serach/SearchOverlay"
import "./TopBar.css"

const TopBar = () => {
    const [showSearch, setShowSearch] = useState(false)

    return (
        <>
            <div className="topbar-container">
                <Link to="/home">
                    <h1>SYU</h1>
                </Link>

                <div className="topbar-search">
                    <button
                        className="search-button"
                        onClick={() => setShowSearch(true)}
                    >
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </button>
                </div>
            </div>

            <SearchOverlay
                isOpen={showSearch}
                onClose={() => setShowSearch(false)}
            />
        </>
    )
}

export default TopBar
