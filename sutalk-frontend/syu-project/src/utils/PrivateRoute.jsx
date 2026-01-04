import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import {showToast} from "./toast.js";


export default function PrivateRoute({ children }) {
    const { accessToken } = useAuthStore.getState();

    if (!accessToken) {
        showToast("error", "로그인이 필요해요");
        return <Navigate to="/" replace />;
    }

    return children;
}