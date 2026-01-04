
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppLayout from "./layouts/AppLayout.jsx";
import IntroLogin from "./components/Login/IntroLogin";
import OAuthSuccess from "./components/OAuth2/OAuthSuccess.jsx";
import UserEnter from "./components/UserEnter/UserEnter";
import ProfileModal from "./components/Profile/ProfileModal";

function App() {
  return (
      <Router>
        <Routes>
          {/* ✅ 로그인 / 회원가입 / 소셜 성공 → 전체화면 */}
          <Route path="/" element={<IntroLogin />} />
          <Route path="/signup" element={<UserEnter />} />
          <Route path="/oauth2/success" element={<OAuthSuccess />} />

          {/* ✅ 메인 앱 라우트 */}
          <Route path="/*" element={<AppLayout />} />

          {/* ✅ 잘못된 경로 → 홈으로 리디렉션 */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>

        <ProfileModal />
        <Toaster position="top-center" reverseOrder={false} />
      </Router>
  );
}

export default App;