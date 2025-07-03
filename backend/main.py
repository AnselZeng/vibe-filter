import os
import re
import uuid
from typing import Optional, List
from pathlib import Path

import replicate
import spotipy
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from spotipy.oauth2 import SpotifyClientCredentials
from dotenv import load_dotenv
import requests
from PIL import Image
import io

load_dotenv(Path(__file__).parent.parent / '.env')

app = FastAPI(title="Music-Inspired Image Stylization API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOADS_DIR = Path("uploads")
UPLOADS_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

spotify_client_id = os.getenv("NEXT_PUBLIC_SPOTIFY_CLIENT_ID")
spotify_client_secret = os.getenv("NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET")
if not spotify_client_id or not spotify_client_secret:
    raise ValueError("Spotify credentials not found in environment variables")

sp = spotipy.Spotify(
    client_credentials_manager=SpotifyClientCredentials(
        client_id=spotify_client_id,
        client_secret=spotify_client_secret
    )
)

replicate_token = os.getenv("REPLICATE_API_TOKEN")
if not replicate_token:
    raise ValueError("Replicate API token not found in environment variables")
os.environ["REPLICATE_API_TOKEN"] = replicate_token

class SongSearchResult(BaseModel):
    id: str
    name: str
    artist: str
    album: str
    image_url: Optional[str] = None

class SongAnalysis(BaseModel):
    mood: str
    keywords: List[str]
    description: str

class SongInfo(BaseModel):
    name: str
    artist: str
    analysis: SongAnalysis

class GenerateResponse(BaseModel):
    original_image_url: str
    stylized_image_url: str
    song_info: SongInfo

def search_songs(query: str, limit: int = 10) -> List[SongSearchResult]:
    try:
        results = sp.search(q=query, type='track', limit=limit)
        songs = []
        for track in results['tracks']['items']:
            album_image = track['album']['images'][0]['url'] if track['album']['images'] else None
            songs.append(SongSearchResult(
                id=track['id'],
                name=track['name'],
                artist=track['artists'][0]['name'],
                album=track['album']['name'],
                image_url=album_image
            ))
        return songs
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error searching Spotify: {str(e)}")

def analyze_song_with_ai(song_name: str, artist_name: str) -> SongAnalysis:
    try:
        analysis_prompt = f"""
        Analyze this song and provide:
        1. The overall mood/emotion (e.g., happy, sad, energetic, calm, romantic, melancholic, angry, peaceful, nostalgic, mysterious)
        2. 5-8 relevant keywords that describe the song's feeling, atmosphere, or theme
        3. A brief description of the song's vibe

        Song: "{song_name}" by {artist_name}

        Respond in this exact format:
        MOOD: [mood]
        KEYWORDS: [keyword1, keyword2, keyword3, keyword4, keyword5]
        DESCRIPTION: [brief description]
        """
        output = replicate.run(
            "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
            input={
                "prompt": analysis_prompt,
                "temperature": 0.7,
                "max_new_tokens": 200,
                "top_p": 0.9
            }
        )
        response_text = "".join(output)
        mood = "neutral"
        keywords = ["atmospheric", "moody"]
        description = "A song with a balanced mood"
        if "MOOD:" in response_text:
            mood_line = response_text.split("MOOD:")[1].split("\n")[0].strip()
            mood = mood_line.lower()
        if "KEYWORDS:" in response_text:
            keywords_line = response_text.split("KEYWORDS:")[1].split("\n")[0].strip()
            keywords = [kw.strip() for kw in keywords_line.strip("[]").split(",")]
        if "DESCRIPTION:" in response_text:
            desc_line = response_text.split("DESCRIPTION:")[1].split("\n")[0].strip()
            description = desc_line
        return SongAnalysis(mood=mood, keywords=keywords, description=description)
    except Exception as e:
        return SongAnalysis(
            mood="neutral",
            keywords=["atmospheric", "moody", "balanced"],
            description="A song with a balanced mood"
        )

def generate_style_prompt_from_keywords(song_analysis: SongAnalysis, song_name: str, artist_name: str) -> str:
    mood = song_analysis.mood
    keywords = song_analysis.keywords
    description = song_analysis.description
    neon_ok = any(
        kw.lower() in ["electronic", "synthwave", "club", "nightlife", "dance", "edm", "disco"] or
        "electronic" in mood or "synth" in mood or "club" in mood or "edm" in mood or "disco" in mood
        for kw in keywords
    )
    try:
        output = replicate.run(
            "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
            input={
                "prompt": f"""
                Based on this song analysis, generate 5-8 specific visual elements that could be gently and subtly added to an existing image to match the song's vibe.

                Song: "{song_name}" by {artist_name}
                Mood: {mood}
                Keywords: {', '.join(keywords)}
                Description: {description}

                This is a photo editing task, NOT an image generation task. Do NOT change, redraw, or reinterpret any part of the original image. Only overlay the following elements as if using Photoshop layers. The original image must remain visually identical except for the addition of these elements.
                Generate ONLY visual elements that could be gently added to an existing room/person/scene (like subtle posters, soft lighting, gentle decorations, pastel accessories, etc.).
                Do NOT include abstract concepts or emotions - only concrete visual items.
                Do NOT suggest 'neon lights' or similar unless the song is clearly electronic, synthwave, or club-themed.
                Prefer subtle, natural, or pastel elements over bold or heavy ones. Avoid strong or overwhelming changes.
                Do NOT suggest anything that would obscure, replace, or alter the main subject, animals, or people in the image. The additions should be overlays or background elements, not replacements.

                Respond with ONLY a comma-separated list of visual elements, nothing else.
                Example format: soft wall art, pastel throw pillows, gentle fairy lights, subtle music notes, delicate plants
                """,
                "temperature": 0.7,
                "max_new_tokens": 100,
                "top_p": 0.9
            }
        )
        response_text = "".join(output).strip()
        visual_elements = [element.strip() for element in response_text.split(",")]
        visual_elements = [elem for elem in visual_elements if elem and len(elem) > 2]
        if not neon_ok:
            visual_elements = [elem for elem in visual_elements if 'neon light' not in elem.lower()]
        visual_elements = visual_elements[:6]
        if not visual_elements:
            visual_elements = ["soft atmospheric lighting", "gentle mood-appropriate decorations"]
    except Exception as e:
        if "rock" in mood or any("rock" in kw.lower() for kw in keywords):
            visual_elements = ["rock posters", "electric guitars", "dramatic lighting"]
        elif "kpop" in mood or any("kpop" in kw.lower() for kw in keywords):
            visual_elements = ["K-pop posters", "colorful lights", "cute decorations"]
        elif "sad" in mood or "melancholic" in mood:
            visual_elements = ["blue lighting", "moody atmosphere", "soft shadows"]
        else:
            visual_elements = ["soft atmospheric lighting", "gentle mood decorations"]
    elements_text = ", ".join(visual_elements)
    prompt = (
        f"Keep the original image unchanged. Gently overlay these elements to match the song's vibe: {elements_text}. "
        f"Do not redraw or reinterpret the scene. Only add subtle decorations or lighting that fit the mood: {mood}, {', '.join(keywords)}. "
        f"Do NOT create a grid, collage, or multiple images. Only a single, unified scene."
    )
    return prompt

@app.get("/search", response_model=List[SongSearchResult])
async def search_songs_endpoint(query: str = Query(..., min_length=1)):
    return search_songs(query)

@app.post("/generate", response_model=GenerateResponse)
async def generate_stylized_image(
    image: UploadFile = File(...),
    track_id: str = Form(...)
):
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    file_extension = Path(image.filename).suffix.lower()
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )
    max_size = 10 * 1024 * 1024
    if image.size and image.size > max_size:
        raise HTTPException(status_code=400, detail="File too large. Maximum 10MB allowed.")
    if not re.match(r'^[a-zA-Z0-9]{22}$', track_id):
        raise HTTPException(status_code=400, detail="Invalid track ID format")
    try:
        track_info = sp.track(track_id)
        song_name = track_info["name"]
        artist_name = track_info["artists"][0]["name"]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching track info: {str(e)}")
    original_filename = f"original_{uuid.uuid4()}{file_extension}"
    original_path = UPLOADS_DIR / original_filename
    with open(original_path, "wb") as buffer:
        content = await image.read()
        buffer.write(content)
    song_analysis = analyze_song_with_ai(song_name, artist_name)
    style_prompt = generate_style_prompt_from_keywords(song_analysis, song_name, artist_name)
    try:
        output = replicate.run(
            "ai-forever/kandinsky-2.2:ea1addaab376f4dc227f5368bbd8eff901820fd1cc14ed8cad63b29249e9d463",
            input={
                "prompt": style_prompt,
                "image": open(original_path, "rb"),
                "strength": 0.1,
                "guidance_scale": 5.0,
                "num_inference_steps": 8,
                "negative_prompt": (
                    "grid, collage, multiple images, mosaic, split image, tiled, four images, 2x2, 3x3, 4x4, duplicate, repeated, panel, comic, storyboard, frames, boxes, layout, montage, compilation, side by side, before and after, comparison, completely different image, new composition, change structure, blurry, low quality, distorted, different scene, alter original objects, change background, modify existing elements, replace main subject, obscure main subject, border, frame, watermark, text, caption"
                )
            }
        )
        stylized_filename = f"stylized_{uuid.uuid4()}.png"
        stylized_path = UPLOADS_DIR / stylized_filename
        response = requests.get(output[0])
        with open(stylized_path, "wb") as f:
            f.write(response.content)
        return GenerateResponse(
            original_image_url=f"/uploads/{original_filename}",
            stylized_image_url=f"/uploads/{stylized_filename}",
            song_info=SongInfo(
                name=song_name,
                artist=artist_name,
                analysis=song_analysis
            )
        )
    except Exception as e:
        if original_path.exists():
            original_path.unlink()
        error_msg = str(e)
        if "CUDA out of memory" in error_msg or "memory" in error_msg.lower():
            raise HTTPException(
                status_code=503, 
                detail="Server is currently busy. Please try again in a few minutes or try with a smaller image."
            )
        elif "resource could not be found" in error_msg:
            raise HTTPException(
                status_code=503,
                detail="Image generation service temporarily unavailable. Please try again."
            )
        else:
            raise HTTPException(status_code=500, detail=f"Error generating image: {error_msg}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Music-Inspired Image Stylization API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("BACKEND_HOST", "0.0.0.0"),
        port=int(os.getenv("BACKEND_PORT", 8000)),
        reload=True
    )