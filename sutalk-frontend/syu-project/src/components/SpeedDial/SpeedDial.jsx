import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiPlus, FiX } from "react-icons/fi";
import "./SpeedDial.css";

/**
 * props:
 *  - actions: [{ key, label, to?, icon: <Icon/>, onClick? }]
 *  - position: 'br' | 'bl' | 'tr' | 'tl'
 *  - radius: number (px)
 *  - arc: number (deg)
 *  - overlay: boolean
 *  - style: React.CSSProperties (예: { bottom: '96px' }로 위치 미세조정)
 *  - closeOnRouteChange: boolean (라우트 변경 시 자동으로 닫기)
 */
export default function SpeedDial({
  actions = [],
  position = "center",
  radius = 88,
  arc = 150,
  overlay = true,
  style = {},
  closeOnRouteChange = true,
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const rootRef = useRef(null);

  // 라우트가 바뀌면 자동으로 닫기 (오버레이 잔상 방지)
  useEffect(() => {
    if (closeOnRouteChange) setOpen(false);
  }, [location.pathname, closeOnRouteChange]);

  // ✅ 중앙 하단 기준 각도 (위로 펼침)
  const baseAngle = useMemo(() => {
    if (position === "center") return 162.5   // 위로 펼치기
    switch (position) {
      case "bl": return -30
      case "br": return 240
      case "tr": return 120
      case "tl": return -120
      default: return 240
    }
  }, [position])

  // 액션 개수에 따른 각도 배분
  const places = useMemo(() => {
    if (!actions || actions.length === 0) return [];
    if (actions.length === 1) return [baseAngle];
    const step = arc / (actions.length - 1);
    return actions.map((_, i) => baseAngle - i * step);
  }, [actions, arc, baseAngle]);

  // 외부 클릭/ESC로 닫기
  useEffect(() => {
    const onClickOutside = (e) => {
      if (open && rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const handleAction = (e, action) => {
    e.stopPropagation();  // 오버레이로 이벤트 전파 방지
    if (action.onClick) action.onClick();
    if (action.to) navigate(action.to);
    setOpen(false);
  };

  // CSS 변수 + 사용자 지정 스타일 병합
  const mergedStyle = { "--sd-radius": `${radius}px`, ...style };

  return (
    <div
      ref={rootRef}
      className={`speed-dial speed-dial--${position} ${open ? "is-open" : ""}`}
      style={mergedStyle}
      aria-label="빠른 메뉴"
    >
      {overlay && open && (
        <div
          className="speed-dial__overlay"
          onClick={() => setOpen(false)}   // 배경 클릭으로 닫기
        />
      )}

      <ul className="speed-dial__list" aria-hidden={!open}>
        {actions.map((action, idx) => {
          const angle = places[idx] * (Math.PI / 180);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius* -1;
          return (
            <li
              key={action.key}
              className="speed-dial__item"
              style={{ "--sd-x": `${x}px`, "--sd-y": `${y}px` }}
            >
              <button
                type="button"
                className="speed-dial__action"
                onClick={(e) => handleAction(e, action)}
                aria-label={action.label}
                title={action.label}
              >
                {action.icon}
              </button>
              <span className="speed-dial__label">{action.label}</span>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className="speed-dial__fab"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
      >
        <span className="speed-dial__fab-icon">
          {open ? <FiX /> : <FiPlus />}
        </span>
      </button>
    </div>
  );
}
