import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, X, Check } from "lucide-react";
import "./ProfileEdit.css";
import axios from "@/api/axiosInstance";
import { useAuthStore } from "@/stores/useAuthStore.js";
import { showToast } from "@/utils/toast";

const ProfileEdit = () => {
  const { userId } = useAuthStore();
  const [newName, setNewName] = useState("");
  const [image, setImage] = useState(null);

  // ✅ 초기 이름과 프로필 이미지 불러오기
  useEffect(() => {
    if (userId) {
      axios.get(`/users/${userId}`).then((res) => {
        setNewName(res.data.name || "");
        if (res.data.profileImage) setImage(res.data.profileImage);
      });
    }
  }, [userId]);

  // ✅ 닉네임 저장
  const handleSave = async () => {
    try {
      await axios.patch(`/users/${userId}/name`, { name: newName });
      showToast("success",`닉네임이 "${newName}"으로 변경되었습니다.`);
      window.history.back();
    } catch (error) {
      console.error("닉네임 변경 실패", error);
      showToast("error","닉네임 변경 중 오류가 발생했습니다.");
    }
  };

  // ✅ 프로필 이미지 업로드
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`/users/${userId}/profile-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImage(res.data.imageUrl);
      showToast("success","프로필 이미지가 변경되었습니다!");
    } catch (err) {
      console.error("프로필 이미지 업로드 실패:", err);
      showToast("error","이미지 업로드 실패");
    }
  };

  const handleClose = () => {
    window.history.back();
  };

  return (
    <div className="profile-edit-container">
      <header className="profile-edit-header">
        <button className="profile-close-button" onClick={handleClose}>
          <X size={20} />
        </button>
        <h2>프로필 수정</h2>
        <button className="save-button" onClick={handleSave}>
          <Check size={20} />
        </button>
      </header>

      <div className="profile-edit-content">
        <motion.div className="profile-avatar" whileHover={{ scale: 1.04 }}>
          {image ? (
            <img src={image} alt="Profile" className="avatar-image" />
          ) : (
            <span className="avatar-placeholder">👤</span>
          )}
          <label className="camera-icon">
            <Camera size={16} />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>
        </motion.div>

        <input
          type="text"
          placeholder="새로운 닉네임을 입력하세요."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="nickname-input"
        />
      </div>
    </div>
  );
};

export default ProfileEdit;
