import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import "./IntroLogin.css"
import LoginForm from "./Login"
import UserEnter from "../UserEnter/UserEnter.jsx";

const IntroLogin = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  // ✅ 스플래시 1초 후 로그인 섹션으로 전환 (데스크탑/모바일 공통)
  useEffect(() => {
    console.log("✅ IntroLogin 렌더됨");
    console.log("초기 showLogin:", showLogin);
    const timer = setTimeout(() => {
      console.log("1초 후 setShowLogin(true)");
      setShowLogin(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  if (showLogin === null) return null;
  return (
    <div className="intro-shell">
      {/* ── 좌측: 캠퍼스 프로모션 (데스크탑 전용, 50% 영역) */}
      <aside className="promo-rail">
        <div className="promo-inner">
          <div className="promo-logo">
            <img src="/assets/수야.png" alt="SU_Talk 로고" />
            <h2>SU_Talk</h2>
          </div>

          <div className="promo-card">
            <h3>🌿 삼육대학교의 모든 소식을 한곳에!</h3>
            <p>
              학교 공지, 행사, 중고거래, 친구 소식까지<br />
              SU_Talk에서 캠퍼스 생활을 더 가깝게 느껴보세요.
            </p>
          </div>

          <div className="promo-bullets">
            <div className="pb-item">캠퍼스 커뮤니티</div>
            <div className="pb-item">실시간 중고 거래</div>
            <div className="pb-item">익명 자유게시판</div>
            <div className="pb-item">동아리 홍보</div>
          </div>
        </div>
      </aside>


      {/* ── 우측: 모바일 스테이지 (데스크탑 50%, 모바일/태블릿에서는 100%) */}
      <main className="mobile-stage">
        {/* 외곽 베젤(데스크탑에서만 보이는 한 겹) */}
        <div className="device-frame">
          {/* 실제 앱 캔버스. 기존 클래스와 호환을 위해 intro-wrapper 포함 */}
          <div className="app-canvas intro-wrapper">
            <AnimatePresence mode="wait">
              {/* (1) 스플래시: 중앙 로고 + 텍스트 */}
              {!showLogin && (
                <motion.div
                  key="logo"
                  className="intro-logo-group"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    transition: { duration: 0.3 },
                  }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}

                >
                  <img src="/assets/수야.png" alt="SU_Talk 로고" className="logo" />
                  <motion.h1
                    className="sutalk-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.45 }}
                  >
                    SU_Talk
                  </motion.h1>
                </motion.div>
              )}

              {/* (2) 로그인 섹션 */}
              {showLogin && (
                <motion.div
                  key="login"
                  className="intro-login-container"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {/* 좌: 브랜드 미니 로고/타이틀 (모바일에서는 숨김) */}
                  <motion.div
                    className="left-logo-group"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <img src="/assets/수야.png" alt="SU_Talk 로고" className="mini-logo" />
                    <h1 className="mini-title">SU_Talk</h1>
                  </motion.div>

                  {/* 우: 로그인/회원가입 폼 (기존 동작 유지) */}
                  <motion.div className="right-login">
                    <AnimatePresence mode="wait">
                      {!isSignup ? (
                        <motion.div
                          key="login-form"
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -40 }}
                          transition={{ duration: 0.5 }}
                        >
                          <LoginForm onSwitch={() => setIsSignup(true)} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="signup-form"
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -40 }}
                          transition={{ duration: 0.5 }}
                        >
                          <UserEnter onSwitch={() => setIsSignup(false)} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IntroLogin;
