import React from "react";
import "./LocationSharePage.css";

export default function UserListModal({ users, onSelect, closeModal }) {
    return (
        <div className="user-list-modal" onClick={closeModal}>
            <div onClick={(e) => e.stopPropagation()}>
                <h3>📍 같은 위치의 사용자 ({users.length}명)</h3>
                <ul>
                    {users.map((u) => (
                        <li key={u.userId} onClick={() => { onSelect(u.userId); closeModal(); }}>
                            <img src={u.profileImage || "/default-image.png"} alt={u.name} />
                            <span>{u.name || "알 수 없음"}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
