import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from '@/api/axiosInstance';
import {useAuthStore} from "@/stores/useAuthStore.js";
import "./UserEnter.css";
import {showToast} from "../../utils/toast.js";

const UserEnter = ({ onSwitch }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    userid: "",
    email: "",
    name: "",
    password: "",
    phone: "",
    status: "ACTIVE",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const { login } = useAuthStore.getState();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await axios.post("/users", form);
      const { userId, accessToken, refreshToken } = res.data;

      // ✅ Zustand 상태에 로그인 정보 저장 (자동 persist)
      login({ userId, accessToken, refreshToken });
      showToast("success","가입 성공");
      setLoading(false);
      onSwitch();
    } catch (error) {
      showToast("error","❌ 에러 발생: " + error.message);
    }
  };

  return (
      <div className="user-enter-container">
        <button className="back-button" onClick={onSwitch}>←</button>

        <div className="enter-card">
          <img src="/assets/default-image.png" alt="logo" className="logo-image" />
          <div className="title">
            <span className="brand">SU_Talk</span> 회원가입
          </div>

          <form onSubmit={handleSubmit} className="enter-form">
            {["userid", "email", "name", "password", "phone"].map((field) => (
                <input
                    key={field}
                    type={field === "password" ? "password" : "text"}
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    placeholder={`${field} 입력`}
                    className="user-input"
                />
            ))}
            <button type="submit" className="enter-button" disabled={loading}>
              {loading ? "가입 중..." : "가입 후 시작하기"}
            </button>
          </form>
        </div>
      </div>
  );
};

export default UserEnter;
