// src/pages/OAuthSuccess.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { showToast } from "@/utils/toast";

export default function OAuthSuccess() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuthStore();

    useEffect(() => {
        const token = params.get("token");
        const userId = params.get("userId");
        const name = decodeURIComponent(params.get("name"));

        if (!token || !userId) {
            showToast("error", "로그인 정보가 올바르지 않습니다.");
            navigate("/login");
            return;
        }

        // ✅ Zustand에 저장
        login({
            userId,
            name,
            accessToken: token,
        });

        showToast("success", `${name}님 환영합니다!`);
        navigate("/home");
    }, []);

    return <div>로그인 중입니다...</div>;
}
