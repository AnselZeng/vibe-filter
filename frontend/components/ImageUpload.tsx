import React, { useCallback, useState } from 'react'

interface ImageUploadProps {
  selectedImage: File | null
  onImageSelect: (file: File | null) => void
}

export default function ImageUpload({ selectedImage, onImageSelect }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = useCallback((file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 10 * 1024 * 1024
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }
    if (file.size > maxSize) {
      alert('File size must be less than 10MB')
      return
    }
    onImageSelect(file)
  }, [onImageSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) handleFileSelect(files[0])
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) handleFileSelect(files[0])
  }, [handleFileSelect])

  const removeImage = useCallback(() => {
    onImageSelect(null)
  }, [onImageSelect])

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-900">
        Upload Image
      </label>
      {!selectedImage ? (
        <div
          className={`border-2 border-dashed border-orange-300 rounded-lg p-6 flex flex-col items-center justify-center transition-colors duration-200
            bg-orange-50 hover:bg-orange-100
            ${isDragOver ? 'bg-orange-100 border-orange-500' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInput}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center border-2 border-orange-400">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700 text-center">
                  Drop your image here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-1 text-center">
                  Supports JPEG, PNG, WebP (max 10MB)
                </p>
              </div>
            </div>
          </label>
        </div>
      ) : (
        <div className="relative">
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected"
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-700">{selectedImage.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={removeImage}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}