import React, { useState } from 'react'
import ImageModal from './ImageModal'

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

interface ResultDisplayProps {
  result: GenerateResponse
  onReset: () => void
}

export default function ResultDisplay({ result, onReset }: ResultDisplayProps) {
  const [modalImage, setModalImage] = useState<string | null>(null)

  return (
    <div className="card">
      <ImageModal
        isOpen={!!modalImage}
        imageUrl={modalImage || ''}
        alt="Full Size"
        onClose={() => setModalImage(null)}
      />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Stylized Image</h2>
        <button onClick={onReset} className="btn-secondary">
          Create New
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700">Original</h3>
          <div className="relative group cursor-pointer" onClick={() => setModalImage(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${result.original_image_url}`)}>
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${result.original_image_url}`}
              alt="Original"
              className="w-full h-64 object-cover rounded-lg shadow-md hover:ring-4 hover:ring-orange-400 transition"
            />
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700">Stylized</h3>
          <div className="relative group cursor-pointer" onClick={() => setModalImage(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${result.stylized_image_url}`)}>
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${result.stylized_image_url}`}
              alt="Stylized"
              className="w-full h-64 object-cover rounded-lg shadow-md hover:ring-4 hover:ring-orange-400 transition"
            />
          </div>
        </div>
      </div>
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">AI Song Analysis</h4>
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full uppercase tracking-wide">
            Mood: {result.song_info.analysis.mood}
          </span>
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Description
            </div>
            <div className="text-sm text-gray-800">
              {result.song_info.analysis.description}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Keywords
            </div>
            <div className="flex flex-wrap gap-2">
              {result.song_info.analysis.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                >
                  {keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}