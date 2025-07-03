import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Music-Inspired Image Stylization',
  description: 'Transform your photos based on the mood of your favorite Spotify songs using AI-powered image stylization.',
  keywords: ['AI', 'image stylization', 'Spotify', 'music', 'art', 'photography'],
  authors: [{ name: 'Music-Inspired Image Stylization' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-orange-50">
        {children}
      </body>
    </html>
  )
}