# 🎵 Music-Inspired Image Stylization App

Transform your photos with AI-powered visual elements that match the mood and vibe of your favourite Spotify songs.

**About:**  
A web app that analyses Spotify songs and uses AI to stylise your images, blending music and visual art in a unique, interactive way.

**[Live Demo](https://vibefilter.vercel.app/)**

---

### 📝 Project Overview

This app lets users upload an image and select a Spotify song. Using AI, it analyses the song's mood and transforms the image to visually match the song's emotional characteristics. The result: a personalised, music-inspired artwork.

### ⚙️ How It Works

1. **Image Upload:** User uploads a photo.
2. **Song Search:** User searches and selects a song from Spotify.
3. **Song Analysis:** The backend fetches the song's mood, keywords, and vibe using Spotify's audio features and AI-powered analysis.
4. **Mood Mapping:** These features are mapped to visual style prompts using a combination of AI and custom logic.
5. **AI Generation:** Stable Diffusion (via Replicate) stylises the image based on the prompt.
6. **Result Display:** Both original and stylised images are shown to the user.

### 🏗️ Architecture & Tech Stack

#### Frontend
- **Next.js 14** (React, TypeScript)
- **TailwindCSS** (Styling)
- **React Hook Form** (Form handling)
- **Axios** (HTTP requests)

#### Backend
- **FastAPI** (Python 3.8+)
- **Pillow** (Image processing)
- **python-multipart** (File uploads)
- **Spotipy** (Spotify API integration)
- **Replicate API** (Stable Diffusion & Llama-2 for AI analysis)
- **Requests** (HTTP requests)
- **OpenAPI/Swagger** (Auto-generated docs)

### ✨ Key Features

- Upload any photo (JPEG, PNG, WebP, up to 10MB)
- Search and select songs from Spotify
- AI analyses song mood and generates visual prompts
- Stable Diffusion transforms the image
- Responsive, modern UI
- Side-by-side comparison of original and stylised images
- Real-time feedback and error handling

### 🎨 Mood-to-Style Mapping (AI Logic)

- The backend uses an AI model (Llama-2 via Replicate) to analyse the selected song and extract its mood, keywords, and a description.
- A custom prompt engineering function then translates these results into concrete visual elements (e.g., posters, lighting, decorations) that match the song's vibe.
- Special logic ensures that only appropriate elements are suggested (e.g., neon lights only for electronic genres, blue lighting for sad songs, etc.).
- The final style prompt is sent to Stable Diffusion (via Replicate) to generate the stylised image.

**🙋‍♂️ Built by Me — powered by Cursor**