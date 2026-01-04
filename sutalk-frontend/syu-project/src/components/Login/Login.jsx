import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Login.css"
import axios from "@/api/axiosInstance"
import { useAuthStore } from "@/stores/useAuthStore"
import { showToast } from "@/utils/toast.js"

const Login = ({ onSwitch }) => {
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!userId || !password) {
      showToast("info", "아이디와 비밀번호를 모두 입력해주세요.")
      return
    }

    try {
      const { data } = await axios.post("/users/login", { userId, password })

      if (!data.accessToken) throw new Error("토큰 발급 실패")

      useAuthStore.getState().login({
        userId: data.userId,
        name: data.name,
        accessToken: data.accessToken,
      })

      showToast("success", `${data.name}님 환영합니다!`)
      navigate("/home")
    } catch (err) {
      console.error("❌ 로그인 오류:", err)
      showToast("error", err.response?.data?.error || "아이디 또는 비밀번호가 올바르지 않습니다.")
    }
  }

  /** ✅ Google OAuth2 로그인 */
  const handleGoogleLogin = () => {
    window.location.href = "https://sutalkmarket.shop/oauth2/authorization/google"
  }

  return (
      <div className="login-container">
        <div className="login-card">
          <img src="/assets/default-image.png" alt="logo" className="login-logo" />
          <h2>SU_Talk 로그인</h2>

          <form onSubmit={handleLogin}>
            <input
                type="text"
                placeholder="User ID 입력"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="user-input"
                autoComplete="username"
            />
            <input
                type="password"
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="user-input"
                autoComplete="current-password"
            />

            {/* ✅ 버튼 2개 (일반 / 구글) */}
            <div className="login-button-group">
              <button type="submit" className="enter-button normal-login">로그인</button>
              <button
                  type="button"
                  className="enter-button google-login"
                  onClick={handleGoogleLogin}
              >
                <img src="/assets/google-logo.png" alt="Google" className="google-icon" />
              </button>
            </div>

            <p>
              계정이 없으신가요?{" "}
              <button type="button" className="link-button" onClick={onSwitch}>
                회원가입
              </button>
            </p>
          </form>
        </div>
      </div>
  )
}

export default Login
