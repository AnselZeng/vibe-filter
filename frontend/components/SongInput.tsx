import React, { useState, useCallback, useEffect, useRef } from 'react'

interface SongSearchResult {
  id: string
  name: string
  artist: string
  album: string
  image_url?: string
}

interface SongInputProps {
  selectedSong: SongSearchResult | null
  onSongSelect: (song: SongSearchResult | null) => void
}

export default function SongInput({ selectedSong, onSongSelect }: SongInputProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SongSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const searchSongs = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/search?query=${encodeURIComponent(query)}`
      )
      if (response.ok) {
        const results = await response.json()
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchSongs(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchSongs])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSongSelect = (song: SongSearchResult) => {
    onSongSelect(song)
    setSearchQuery(`${song.name} - ${song.artist}`)
    setShowResults(false)
  }

  const handleClearSelection = () => {
    onSongSelect(null)
    setSearchQuery('')
    setSearchResults([])
  }

  return (
    <div className="space-y-4">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
        <label className="block text-orange-700 font-semibold mb-2 text-gray-900">Search for Song</label>
        <div className="relative mb-4" ref={containerRef}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowResults(true)
                if (!e.target.value) {
                  onSongSelect(null)
                }
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Search for a song or artist..."
              className="input-field pr-10 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            {selectedSong && (
              <button
                onClick={handleClearSelection}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((song) => (
                <button
                  key={song.id}
                  onClick={() => handleSongSelect(song)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-shrink-0">
                    {song.image_url ? (
                      <img
                        src={song.image_url}
                        alt={song.album}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {song.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {song.artist} • {song.album}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {showResults && searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
              <p className="text-sm text-gray-500 text-center">
                No songs found for "{searchQuery}"
              </p>
            </div>
          )}
        </div>
        {selectedSong && (
          <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              {selectedSong.image_url ? (
                <img
                  src={selectedSong.image_url}
                  alt={selectedSong.album}
                  className="w-12 h-12 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                  </svg>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-orange-900">
                  {selectedSong.name}
                </h3>
                <p className="text-orange-800">
                  {selectedSong.artist} • {selectedSong.album}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 5a1 1 0 011 1v1h1a1 1 0 110 2H9v1a1 1 0 11-2 0V9H6a1 1 0 110-2h1V6a1 1 0 011-1z" />
          </svg>
          <span>Search for any song to analyze its mood and style your image</span>
        </div>
      </div>
      {error && (
        <div className="mt-2 text-sm text-orange-700 bg-orange-100 rounded px-2 py-1">
          {error}
        </div>
      )}
    </div>
  )
}