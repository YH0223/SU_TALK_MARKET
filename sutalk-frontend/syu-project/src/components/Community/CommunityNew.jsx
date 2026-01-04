import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "./community.api.js";
import { useImageUpload } from "@/hooks/useImageUpload";
import "./Community.css";
import {useAuthStore} from "@/stores/useAuthStore.js";
import { showToast } from "@/utils/toast";
const CATEGORIES = {
  FREE: "자유",
  FRIENDSHIP: "친목",
  INFO: "정보",
  JOBS: "구인/구직",
  HOBBY: "취미",
};

const CommunityNew = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("FREE");
  const [submitting, setSubmitting] = useState(false);

  const { images, previews, handleImageUpload, deleteImage } = useImageUpload(5);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const currentUserId = useAuthStore.getState().userId;
    if (!currentUserId) {
      showToast("info","글을 작성하려면 로그인이 필요합니다.");
      setSubmitting(false);
      return;
    }

    if (!title.trim() || !content.trim()) {
      showToast("error","제목과 내용을 모두 입력해주세요.");
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      const postData = {
        title,
        content,
        authorId: currentUserId,
        category,
      };
      formData.append(
          "post",
          new Blob([JSON.stringify(postData)], { type: "application/json" })
      );

      images.forEach((file) => {
        formData.append("images", file);
      });

      const newPost = await createPost(formData);

      showToast("success","게시글이 성공적으로 등록되었습니다.");
      navigate(`/community/post/${newPost.id}`, { replace: true });
    } catch (error) {
      console.error("게시글 작성 실패:", error);
      showToast("error","게시글 작성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="community-wrap">
        <header className="community-header">
          <h2>글쓰기</h2>
        </header>

        <form className="community-form" onSubmit={onSubmit}>
          <div className="image-upload">
            <div className="image-preview">
              <label htmlFor="image-input" className="image-label">
                <span>📷</span> {previews.length}/5
              </label>
              {previews.map((preview, index) => (
                  <div key={index} className="image-item">
                    <img src={preview} alt={`미리보기 ${index + 1}`} />
                    <button
                        type="button"
                        className="delete-image-button"
                        onClick={() => deleteImage(index)}
                        disabled={submitting}
                    >
                      ×
                    </button>
                  </div>
              ))}
            </div>
            <input
                type="file"
                id="image-input"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
                style={{ display: "none" }}
                disabled={submitting}
            />
          </div>

          <label>
            카테고리
            <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={submitting}>
              {Object.entries(CATEGORIES).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </label>

          <label>
            제목
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                disabled={submitting}
            />
          </label>

          <label>
            내용
            <textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                disabled={submitting}
            />
          </label>

          <div className="community-actions">
            <button
                type="button"
                className="ghost"
                onClick={() => navigate(-1)}
                disabled={submitting}
            >
              취소
            </button>
            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? "등록 중…" : "등록"}
            </button>
          </div>
        </form>
      </div>
  );
};

export default CommunityNew;