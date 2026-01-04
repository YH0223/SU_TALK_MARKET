import React from "react";
import "./Nav.css";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faEnvelope, faUser, faUsers } from "@fortawesome/free-solid-svg-icons";

const Nav = () => {
  const location = useLocation();

  return (
    <nav className="nav">
      <ul className="nav-list">
        <li className="nav-item">
          <Link
            to="/home"
            className={`nav-link ${location.pathname === "/home" ? "active" : ""}`}>
            <FontAwesomeIcon icon={faHome} />
            <span>홈</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link
            to="/community"
            className={`nav-link ${location.pathname === "/community" ? "active" : ""}`}>
            <FontAwesomeIcon icon={faUsers} />
            <span>커뮤니티</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link
            to="/chatlist"
            className={`nav-link ${location.pathname === "/chatlist" ? "active" : ""}`}>
            <FontAwesomeIcon icon={faEnvelope} />
            <span>메시지</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link
            to="/profile"
            className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`}>
            <FontAwesomeIcon icon={faUser} />
            <span>프로필</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
