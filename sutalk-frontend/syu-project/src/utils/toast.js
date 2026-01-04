import toast from "react-hot-toast";

/**
 * ✅ 전역 토스트 헬퍼
 * @param {"success"|"error"|"info"} type - 토스트 종류
 * @param {string} message - 표시할 메시지
 * @param {object} [options] - react-hot-toast 옵션
 */
export const showToast = (type, message, options = {}) => {
    const base = {
        duration: 2500,
        style: {
            borderRadius: "8px",
            background: "#333",
            color: "#fff",
            fontSize: "15px",
        },
        ...options,
    };

    switch (type) {
        case "success":
            toast.success(message, base);
            break;
        case "error":
            toast.error(message, base);
            break;
        case "info":
        default:
            toast(message, base);
            break;
    }
};