"use client"

import { useState, useCallback } from "react"

/**
 * 폼 데이터를 관리하는 범용 훅
 */
export const useFormData = (initialState = {}) => {
  const [formData, setFormData] = useState(initialState)

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const updateFields = useCallback((fields) => {
    setFormData((prev) => ({ ...prev, ...fields }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData(initialState)
  }, [initialState])

  return { formData, updateField, updateFields, resetForm, setFormData }
}
