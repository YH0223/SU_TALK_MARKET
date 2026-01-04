"use client"

import { useState, useCallback } from "react"

/**
 * 이미지 슬라이더 상태를 관리하는 훅
 */
export const useImageSlider = (totalImages = 0) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [prevImageIndex, setPrevImageIndex] = useState(0)

  const changeImage = useCallback(
    (nextIndex) => {
      setPrevImageIndex(currentImageIndex)
      setCurrentImageIndex(nextIndex)
    },
    [currentImageIndex],
  )

  const nextImage = useCallback(() => {
    const nextIndex = (currentImageIndex + 1) % totalImages
    changeImage(nextIndex)
  }, [currentImageIndex, totalImages, changeImage])

  const prevImage = useCallback(() => {
    const nextIndex = (currentImageIndex - 1 + totalImages) % totalImages
    changeImage(nextIndex)
  }, [currentImageIndex, totalImages, changeImage])

  const goToImage = useCallback(
    (index) => {
      changeImage(index)
    },
    [changeImage],
  )

  return {
    currentImageIndex,
    prevImageIndex,
    nextImage,
    prevImage,
    goToImage,
  }
}
