"use client"

import { useState, useCallback } from "react"
import {showToast} from "../utils/toast.js";

/**
 * 이미지 업로드를 관리하는 훅
 */
export const useImageUpload = (maxImages = 5) => {
    const [images, setImages] = useState([])
    const [previews, setPreviews] = useState([])

    const handleImageUpload = useCallback(
        (files) => {
            const fileArray = Array.from(files)

            if (fileArray.length + images.length > maxImages) {
                showToast("info",`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`)
                return false
            }

            const newPreviews = fileArray.map((file) => URL.createObjectURL(file))

            setImages((prev) => [...prev, ...fileArray])
            setPreviews((prev) => [...prev, ...newPreviews])

            return true
        },
        [images.length, maxImages],
    )

    const deleteImage = useCallback((index) => {
        setImages((prev) => prev.filter((_, i) => i !== index))
        setPreviews((prev) => {
            const newPreviews = prev.filter((_, i) => i !== index)
            // 메모리 누수 방지: 삭제된 preview URL 해제
            URL.revokeObjectURL(prev[index])
            return newPreviews
        })
    }, [])

    const clearImages = useCallback(() => {
        // 모든 preview URL 해제
        previews.forEach((url) => URL.revokeObjectURL(url))
        setImages([])
        setPreviews([])
    }, [previews])

    return {
        images,
        previews,
        handleImageUpload,
        deleteImage,
        clearImages,
    }
}