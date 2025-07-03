'use client'

import React, { useState } from 'react'
import ImageUpload from '@/components/ImageUpload'
import SongInput from '@/components/SongInput'
import GenerateButton from '@/components/GenerateButton'
import ResultDisplay from '@/components/ResultDisplay'

interface SongSearchResult {
  id: string
  name: string
  artist: string
  album: string
  image_url?: string
}

interface SongAnalysis {
  mood: string
  keywords: string[]
  description: string
}

interface SongInfo {
  name: string
  artist: string
  analysis: SongAnalysis
}

interface GenerateResponse {
  original_image_url: string
  stylized_image_url: string
  song_info: SongInfo
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedSong, setSelectedSong] = useState<SongSearchResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>('')
  const [result, setResult] = useState<GenerateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!selectedImage || !selectedSong) {
      setError('Please select an image and choose a song')
      return
    }
    setIsGenerating(true)
    setCurrentStep('analyzing')
    setError(null)
    try {
      const formData = new FormData()
      formData.append('image', selectedImage)
      formData.append('track_id', selectedSong.id)
      setCurrentStep('generating')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/generate`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to generate image')
      }
      const data: GenerateResponse = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsGenerating(false)
      setCurrentStep('')
    }
  }

  const handleReset = () => {
    setSelectedImage(null)
    setSelectedSong(null)
    setResult(null)
    setError(null)
    setCurrentStep('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <main className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Music-Inspired Image Stylization
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-6">
              Transform your photos based on the mood of your favorite Spotify songs using AI-powered image stylization.
            </p>
            <p className="text-sm text-gray-500 max-w-3xl mx-auto">
              Upload a photo and select a song to let the AI generate a new image inspired by your photo and the song's mood, theme, and style.
              The result is a creative reinterpretation, often blending new decorations, lighting effects, and atmospheric elements based on the music.
            </p>
          </div>
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Transform Your Image</h2>
            <div className="space-y-6">
              <ImageUpload 
                selectedImage={selectedImage}
                onImageSelect={setSelectedImage}
              />
              <SongInput 
                selectedSong={selectedSong}
                onSongSelect={setSelectedSong}
              />
              <GenerateButton 
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                disabled={!selectedImage || !selectedSong}
                currentStep={currentStep}
              />
            </div>
          </div>
          {error && (
            <div className="card bg-red-50 border-red-200">
              <div className="flex items-center space-x-2 text-red-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Error: {error}</span>
              </div>
            </div>
          )}
          {result && (
            <ResultDisplay 
              result={result}
              onReset={handleReset}
            />
          )}
        </main>
      </div>
    </div>
  )
}