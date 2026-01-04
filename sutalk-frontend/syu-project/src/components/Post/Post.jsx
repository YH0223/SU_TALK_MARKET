"use client"
import { useNavigate } from "react-router-dom"
import axios from "@/api/axiosInstance"
import "./Post.css"
import KakaoMapPicker from "../KakaoMap/KakaoMapPicker"
import { useFormData } from "@/hooks/useFormData"
import { useImageUpload } from "@/hooks/useImageUpload"
import {useAuthStore} from "@/stores/useAuthStore.js";
import { showToast } from "@/utils/toast";

const Post = () => {
  const navigate = useNavigate()

  const { formData, updateField, updateFields } = useFormData({
    title: "",
    category: "",
    price: "",
    description: "",
    location: "",
    lat: null,
    lng: null,
  })

  const { images, previews, handleImageUpload, deleteImage } = useImageUpload(5)

  const handleSubmit = async () => {
    const { title, category, price } = formData
    if (!title || !category || !price) {
      showToast("error","필수 항목을 모두 입력해주세요.")
      return
    }

    const senderId = useAuthStore.getState().userId;
    if (!senderId) {
      showToast("info","로그인 정보가 없습니다.")
      return
    }

    const data = new FormData()
    data.append(
      "item",
      new Blob(
        [
          JSON.stringify({
            title: formData.title,
            category: formData.category,
            price: formData.price,
            description: formData.description,
            meetLocation: formData.location,
            sellerId: senderId,
          }),
        ],
        { type: "application/json" },
      ),
    )

    images.forEach((file) => data.append("images", file))

    try {
      const response = await axios.post("/items", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.status !== 200) throw new Error("서버 오류")

      showToast("success","게시글이 작성되었습니다!")
      navigate(-1)
    } catch (error) {
      console.error("❌ 게시글 작성 실패:", error)
      showToast("error","게시글 작성에 실패했습니다.")
    }
  }

  return (
    <div className="post-container">
      <header className="post-header">
        <button className="close-button" onClick={() => navigate(-1)}>
          &lt;
        </button>
        <h3>글쓰기</h3>
      </header>

      <div className="image-upload">
        <div className="image-preview">
          {previews.map((preview, index) => (
            <div key={index} className="image-item">
              <img loading="lazy" src={preview || "/placeholder.svg"} alt={`미리보기 ${index + 1}`} />
              <button className="delete-image-button" onClick={() => deleteImage(index)}>
                ×
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label htmlFor="image-input" className="image-label">
              <span>📷</span> {images.length}/5
            </label>
          )}
        </div>
        <input
          type="file"
          id="image-input"
          multiple
          accept="image/*"
          onChange={(e) => handleImageUpload(e.target.files)}
          style={{ display: "none" }}
        />
      </div>

      <form className="post-form">
        <input
          type="text"
          placeholder="제목"
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
        />

        <select
          className="category-select"
          value={formData.category}
          onChange={(e) => updateField("category", e.target.value)}
        >
          <option value="" disabled>
            카테고리 선택
          </option>
          {["전자제품", "가구", "의류", "도서", "생활용품", "스포츠/레저", "기타"].map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="가격 (원)"
          value={formData.price}
          onChange={(e) => updateField("price", e.target.value)}
        />

        <textarea
          placeholder="자세한 설명"
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
        ></textarea>

        <input type="text" placeholder="거래 희망 장소" value={formData.location} readOnly />

        <KakaoMapPicker
          onSelect={(place) =>
            updateFields({
              location: place.address,
              lat: place.lat,
              lng: place.lng,
            })
          }
        />

        <button type="button" className="submit-button" onClick={handleSubmit}>
          작성 완료
        </button>
      </form>
    </div>
  )
}

export default Post
