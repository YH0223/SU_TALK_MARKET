"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "@/api/axiosInstance"
import "./Post.css"
import { useAuthStore } from "@/stores/useAuthStore.js"
import {
  toAbs,
  toThumbAbs,
  createImageErrorHandler,
  pickFirstPhotoPath,
} from "@/utils/imageHelpers"
import {showToast} from "../../utils/toast.js";

const PostEdit = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { postData: initialData } = location.state || {}
  const isEditMode = !!initialData

  const [imageFiles, setImageFiles] = useState([])
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    category: initialData?.category || "",
    price: initialData?.price || "",
    description: initialData?.description || "",
    location: initialData?.meetLocation || "",
    images: initialData?.itemImages || [], // ✅ 기존 이미지 유지
  })

  const [previews, setPreviews] = useState([])

  /** ✅ 이미지 미리보기 (기존 + 새로 추가된 이미지 병합) */
  useEffect(() => {
    const existingImages = formData.images.map((img) => {
      const originPath = pickFirstPhotoPath({ itemImages: [img] })
      const originUrl = originPath ? toAbs(originPath) : "/assets/default-image.png"
      const thumbUrl = originPath ? toThumbAbs(originPath) : "/assets/default-image.png"
      return { thumbUrl, originUrl, isExisting: true, path: img }
    })

    const newUploads = imageFiles.map((file) => ({
      thumbUrl: URL.createObjectURL(file),
      originUrl: URL.createObjectURL(file),
      isExisting: false,
    }))

    setPreviews([...existingImages, ...newUploads])
  }, [formData.images, imageFiles])

  /** ✅ 이미지 업로드 */
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + previews.length > 5) {
      showToast("info","최대 5개의 이미지만 업로드할 수 있습니다.")
      return
    }
    setImageFiles((prev) => [...prev, ...files])
  }

  /** ✅ 이미지 삭제 (기존 + 신규 구분) */
  const handleDeleteImage = (index) => {
    const target = previews[index]

    if (target.isExisting) {
      // 기존 이미지 삭제 → formData.images에서 제거
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }))
    } else {
      // 신규 업로드된 이미지 삭제
      const newFiles = imageFiles.filter((_, i) => i !== index - formData.images.length)
      setImageFiles(newFiles)
    }

    // 미리보기 리스트 갱신
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  /** ✅ 게시글 저장 */
  const handleSubmit = async () => {
    const sellerId = useAuthStore.getState().userId
    if (!sellerId) {
      showToast("error","로그인 정보가 없습니다.")
      return
    }

    const itemData = {
      title: formData.title,
      category: formData.category,
      price: Number(formData.price),
      description: formData.description,
      meetLocation: formData.location,
      sellerId,
    }

    const requestForm = new FormData()
    requestForm.append("item", new Blob([JSON.stringify(itemData)], { type: "application/json" }))

    // ✅ 기존 이미지 경로를 existingImages로 전송 (백엔드 유지용)
    if (Array.isArray(formData.images)) {
      formData.images.forEach((imgPath) => {
        if (typeof imgPath === "string" && imgPath.startsWith("/uploads/")) {
          requestForm.append("existingImages", imgPath)
        }
      })
    }

    // ✅ 새로 추가된 이미지 파일 전송
    imageFiles.forEach((file) => requestForm.append("images", file))

    try {
      let response
      if (isEditMode) {
        response = await axios.put(`/items/${initialData.itemid}`, requestForm, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        showToast("success","게시글이 수정되었습니다!")
      } else {
        response = await axios.post("/items", requestForm, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        showToast("success","게시글이 작성되었습니다!")
      }

      navigate(`/post/${response.data.itemid}`)
    } catch (error) {
      console.error("❌ 저장 중 에러 발생:", error)
      showToast("error","에러가 발생했어요. 콘솔을 확인해주세요.")
    }
  }

  return (
    <div className="post-container">
      <header className="post-header">
        <button className="close-button" onClick={() => navigate(-1)}>
          &lt;
        </button>
        <h3>{isEditMode ? "게시글 수정" : "글쓰기"}</h3>
      </header>

      <div className="image-upload">
        <div className="image-preview">
          {previews.length > 0 ? (
            previews.map((img, index) => (
              <div key={index} className="image-item">
                <img
                  loading="lazy"
                  src={img.thumbUrl}
                  alt={`미리보기 ${index + 1}`}
                  className="sales-image"
                  onError={createImageErrorHandler(img.originUrl)}
                />
                <button
                  className="delete-image-button"
                  onClick={() => handleDeleteImage(index)}
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <div className="image-item no-image">
              <img src="/assets/default-image.png" alt="기본 이미지" />
            </div>
          )}

          {previews.length < 5 && (
            <label htmlFor="image-input" className="image-label">
              <span>📷</span> {previews.length}/5
            </label>
          )}
        </div>

        <input
          type="file"
          id="image-input"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
      </div>

      <form className="post-form">
        <input
          type="text"
          placeholder="제목"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
        />
        <select
          className="category-select"
          value={formData.category}
          onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
        >
          <option value="" disabled>
            카테고리 선택
          </option>
          {["전자제품", "가구", "의류", "도서", "생활용품", "스포츠/레저", "기타"].map(
            (cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ),
          )}
        </select>
        <input
          type="number"
          placeholder="가격 (원)"
          value={formData.price}
          onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
        />
        <textarea
          placeholder="자세한 설명"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        />
        <input
          type="text"
          placeholder="거래 희망 장소"
          value={formData.location}
          onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
        />
        <button type="button" className="submit-button" onClick={handleSubmit}>
          {isEditMode ? "수정 완료" : "작성 완료"}
        </button>
      </form>
    </div>
  )
}

export default PostEdit
