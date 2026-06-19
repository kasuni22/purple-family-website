from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware 
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Optional
import shutil
import os
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME", "dgdpuo8og"),
    api_key = os.environ.get("CLOUDINARY_API_KEY", "758787818257213"),
    api_secret = os.environ.get("CLOUDINARY_API_SECRET", "")
)
from typing import Optional
from pydantic import BaseModel

from .database import engine, get_db
from . import models, schemas, auth

models.Base.metadata.create_all(bind=engine)

with engine.begin() as conn:
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS app_settings (
            key VARCHAR PRIMARY KEY,
            value VARCHAR,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

print("Using SQLAlchemy models for PostgreSQL schema creation")

print("Using SQLAlchemy models for PostgreSQL schema creation")

app = FastAPI(title="Purple Family API 💜")

@app.get("/")
def root():
    return {"message": "Purple Family API is live 💜"}


# CORS - allows React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://purple-family-website.vercel.app",
        "https://purple-family-website-58bylyu9l-kasuni22s-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BTS_ALBUMS_SEED = [
    {"name": "ARIRANG", "year": 2025},
    {"name": "PERMISSION TO DANCE ON STAGE - LIVE", "year": 2024},
    {"name": "Take Two", "year": 2023},
    {"name": "Proof", "year": 2022},
    {"name": "butter", "year": 2021},
    {"name": "BUTTER", "year": 2021},
    {"name": "BE", "year": 2020},
    {"name": "DYNAMITE", "year": 2020},
    {"name": "MAP OF THE SOUL : 7", "year": 2020},
    {"name": "MAP OF THE SOUL : PERSONA", "year": 2019},
    {"name": "LOVE YOURSELF 結 'ANSWER'", "year": 2018},
    {"name": "LOVE YOURSELF 轉 'TEAR'", "year": 2018},
    {"name": "LOVE YOURSELF 承 'HER'", "year": 2017},
    {"name": "YOU NEVER WALK ALONE", "year": 2017},
    {"name": "WINGS", "year": 2016},
    {"name": "THE MOST BEAUTIFUL MOMENT IN LIFE : YOUNG FOREVER", "year": 2016},
    {"name": "THE MOST BEAUTIFUL MOMENT IN LIFE PT.2", "year": 2015},
    {"name": "THE MOST BEAUTIFUL MOMENT IN LIFE PT.1", "year": 2015},
    {"name": "DARK & WILD", "year": 2014},
    {"name": "SKOOL LUV AFFAIR", "year": 2014},
    {"name": "O!RUL8,2?", "year": 2013},
    {"name": "2 COOL 4 SKOOL", "year": 2013},
]


SOLO_ALBUMS_SEED = {
    "RM": [
        {"name": "Right Place, Wrong Person", "year": 2024, "youtube_url": "https://youtube.com/playlist?list=PL5hrGMysD_GsXxbdeZzbaXioGe27vRsdp&si=g0lvjWwd8ny5AQRO"},
        {"name": "Indigo", "year": 2022, "youtube_url": ""},
        {"name": "Bicycle", "year": 2021, "youtube_url": ""},
        {"name": "MONO.", "year": 2018, "youtube_url": ""},
    ],
    "Jin": [
        {"name": "ECHO", "year": 2025, "youtube_url": ""},
        {"name": "HAPPY", "year": 2024, "youtube_url": ""},
        {"name": "The Astronaut", "year": 2022, "youtube_url": ""},
        {"name": "Super Tuna", "year": 2021, "youtube_url": ""},
        {"name": "Abyss", "year": 2020, "youtube_url": ""},
        {"name": "TONIGHT", "year": 2019, "youtube_url": ""},
    ],
    "SUGA": [
        {"name": "D-DAY", "year": 2023, "youtube_url": ""},
        {"name": "D-2", "year": 2020, "youtube_url": ""},
        {"name": "Agust D", "year": 2016, "youtube_url": ""},
    ],
    "j-hope": [
        {"name": "Killin' It Girl", "year": 2025, "youtube_url": ""},
        {"name": "MONA LISA", "year": 2025, "youtube_url": ""},
        {"name": "Sweet Dreams (feat. Miguel)", "year": 2025, "youtube_url": ""},
        {"name": "HOPE ON THE STREET VOL.1", "year": 2024, "youtube_url": ""},
        {"name": "Jack In The Box (HOPE Edition)", "year": 2023, "youtube_url": ""},
        {"name": "on the street", "year": 2023, "youtube_url": ""},
        {"name": "Jack In The Box", "year": 2022, "youtube_url": ""},
        {"name": "Blue Side", "year": 2021, "youtube_url": ""},
        {"name": "Chicken Noodle Soup", "year": 2019, "youtube_url": ""},
        {"name": "Hope World", "year": 2018, "youtube_url": ""},
    ],
    "Jimin": [
        {"name": "MUSE", "year": 2024, "youtube_url": ""},
        {"name": "Closer Than This", "year": 2023, "youtube_url": ""},
        {"name": "Face", "year": 2023, "youtube_url": ""},
        {"name": "Christmas Love", "year": 2020, "youtube_url": ""},
        {"name": "Promise", "year": 2018, "youtube_url": ""},
    ],
    "V": [
        {"name": "Winter Ahead", "year": 2024, "youtube_url": ""},
        {"name": "FRI(END)S", "year": 2024, "youtube_url": ""},
        {"name": "Layover", "year": 2023, "youtube_url": ""},
        {"name": "Snow Flower", "year": 2020, "youtube_url": ""},
        {"name": "Winter Bear", "year": 2019, "youtube_url": ""},
        {"name": "Scenery", "year": 2019, "youtube_url": ""},
    ],
    "Jung Kook": [
        {"name": "Never Let Go", "year": 2024, "youtube_url": ""},
        {"name": "GOLDEN", "year": 2023, "youtube_url": ""},
        {"name": "3D", "year": 2023, "youtube_url": ""},
        {"name": "Seven", "year": 2023, "youtube_url": ""},
        {"name": "My You", "year": 2022, "youtube_url": ""},
        {"name": "Still With You", "year": 2020, "youtube_url": ""},
    ],
}

def serialize_album(album: models.Album, current_user: Optional[models.User] = None):
    can_edit = bool(current_user and (current_user.is_admin or album.created_by_id == current_user.id))
    can_delete = bool(current_user and current_user.is_admin)
    return {
        "id": album.id,
        "name": album.name,
        "artist": album.artist,
        "year": album.year,
        "album_type": album.album_type,
        "image_url": album.image_url,
        "playlist_url": album.playlist_url,
        "created_by_id": album.created_by_id,
        "created_by_username": album.created_by.username if album.created_by else None,
        "created_at": album.created_at,
        "can_edit": can_edit,
        "can_delete": can_delete,
    }

def seed_albums(db: Session):
    if db.query(models.Album).first():
        return

    for album in BTS_ALBUMS_SEED:
        db.add(models.Album(
            name=album["name"],
            artist="BTS",
            year=album.get("year"),
            album_type="BTS",
            image_url="",
            playlist_url="",
            created_by_id=None,
        ))

    for artist, albums in SOLO_ALBUMS_SEED.items():
        for album in albums:
            db.add(models.Album(
                name=album["name"],
                artist=artist,
                year=album.get("year"),
                album_type="Solo",
                image_url="",
                playlist_url=album.get("youtube_url", ""),
                created_by_id=None,
            ))
    db.commit()

# Old solo album serializer kept only for old /solo-albums compatibility.
def serialize_solo_album(album: models.SoloAlbum):
    return {
        "id": album.id,
        "name": album.name,
        "artist": album.artist,
        "year": album.year,
        "image_url": album.image_url,
        "youtube_url": album.youtube_url,
        "created_at": album.created_at,
    }

def seed_solo_albums(db: Session):
    if db.query(models.SoloAlbum).first():
        return
    for artist, albums in SOLO_ALBUMS_SEED.items():
        for album in albums:
            db.add(models.SoloAlbum(
                name=album["name"],
                artist=artist,
                year=album.get("year"),
                image_url="",
                youtube_url=album.get("youtube_url", ""),
            ))
    db.commit()

def serialize_song(song: models.Song, current_user: models.User, db: Session):
    favorites_count = db.query(models.SongFavorite).filter(models.SongFavorite.song_id == song.id).count()
    favorited_by_current_user = db.query(models.SongFavorite).filter(
        models.SongFavorite.song_id == song.id,
        models.SongFavorite.user_id == current_user.id
    ).first() is not None
    return {
        "id": song.id,
        "title": song.title,
        "artist": song.artist,
        "lyrics": song.lyrics,
        "youtube_url": song.youtube_url,
        "release_year": song.release_year,
        "album": song.album,
        "album_id": song.album_id,
        "song_type": song.song_type,
        "solo_artist": song.solo_artist,
        "image_url": song.image_url,
        "added_by_id": song.added_by_id,
        "added_by_username": song.added_by.username if song.added_by else None,
        "created_at": song.created_at,
        "favorites_count": favorites_count,
        "favorited_by_current_user": favorited_by_current_user,
        "can_edit": bool(current_user and (current_user.is_admin or song.added_by_id == current_user.id)),
        "can_delete": bool(current_user and current_user.is_admin),
    }

# ─── AUTH ROUTES ───────────────────────────────────────────

@app.post("/auth/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=auth.hash_password(user.password),
        birthday=user.birthday,
        country=user.country,
        bias=user.bias
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/auth/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# ─── POST ROUTES ───────────────────────────────────────────

@app.post("/posts", response_model=schemas.PostOut)
def create_post(post: schemas.PostCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    new_post = models.Post(**post.model_dump(), owner_id=current_user.id)
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

@app.get("/posts")
def get_posts(db: Session = Depends(get_db)):
    posts = db.query(models.Post).order_by(models.Post.created_at.desc()).all()
    result = []

    for p in posts:
        owner = db.query(models.User).filter(models.User.id == p.owner_id).first()
        result.append(
            {
                "id": p.id,
                "title": p.title,
                "content": p.content,
                "owner_id": p.owner_id,
                "created_at": p.created_at,
                "username": owner.username if owner else "Deleted ARMY",
                "nickname": owner.nickname if owner else None,
                "profile_picture": owner.profile_picture if owner else None,
                "bias": owner.bias if owner else None,
                "can_delete": False,
            }
        )

    return result


@app.delete("/posts/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if not current_user.is_admin and post.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    db.delete(post)
    db.commit()

    return {"detail": "Post deleted"}

# ─── WALLPAPER ROUTES ──────────────────────────────────────

@app.post("/wallpapers")
def upload_wallpaper(
    title: str = Form(...),
    member: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    result = cloudinary.uploader.upload(file.file, folder="wallpapers")
    file_path = result["secure_url"]

    wallpaper = models.Wallpaper(
        title=title,
        file_path=file_path,
        member=member,
        uploaded_by_id=current_user.id
    )

    db.add(wallpaper)
    db.commit()
    db.refresh(wallpaper)

    return {
        "id": wallpaper.id,
        "title": wallpaper.title,
        "file_path": wallpaper.file_path,
        "member": wallpaper.member,
        "created_at": wallpaper.created_at,
        "uploaded_by_id": wallpaper.uploaded_by_id,
        "uploaded_by_username": current_user.nickname or current_user.username,
        "likes_count": 0,
        "liked_by_current_user": False,
        "can_edit": True,
        "can_delete": True,
    }

@app.get("/wallpapers")
def get_wallpapers(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    wallpapers = db.query(models.Wallpaper).order_by(
        models.Wallpaper.created_at.desc()
    ).all()

    return [
        {
            "id": w.id,
            "title": w.title,
            "file_path": w.file_path,
            "member": w.member,
            "created_at": w.created_at,
            "uploaded_by_id": w.uploaded_by_id,
            "uploaded_by_username": (
                w.uploaded_by.nickname or w.uploaded_by.username
                if w.uploaded_by else "Deleted ARMY"
            ),
            "likes_count": db.query(models.WallpaperLike).filter(
                models.WallpaperLike.wallpaper_id == w.id
            ).count(),
            "liked_by_current_user": db.query(models.WallpaperLike).filter(
                models.WallpaperLike.wallpaper_id == w.id,
                models.WallpaperLike.user_id == current_user.id
            ).first() is not None,
            "can_edit": bool(
                current_user.is_admin or w.uploaded_by_id == current_user.id
            ),
            "can_delete": bool(
                current_user.is_admin or w.uploaded_by_id == current_user.id
            ),
        }
        for w in wallpapers
    ]

@app.put("/wallpapers/{wallpaper_id}")
def update_wallpaper(
    wallpaper_id: int,
    title: str = Form(...),
    member: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    wallpaper = db.query(models.Wallpaper).filter(
        models.Wallpaper.id == wallpaper_id
    ).first()

    if not wallpaper:
        raise HTTPException(status_code=404, detail="Wallpaper not found")

    if not current_user.is_admin and wallpaper.uploaded_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this wallpaper")

    wallpaper.title = title
    wallpaper.member = member

    db.commit()
    db.refresh(wallpaper)

    return {
        "id": wallpaper.id,
        "title": wallpaper.title,
        "file_path": wallpaper.file_path,
        "member": wallpaper.member,
        "created_at": wallpaper.created_at,
        "uploaded_by_id": wallpaper.uploaded_by_id,
        "uploaded_by_username": current_user.nickname or current_user.username,
        "likes_count": db.query(models.WallpaperLike).filter(
            models.WallpaperLike.wallpaper_id == wallpaper.id
        ).count(),
        "liked_by_current_user": db.query(models.WallpaperLike).filter(
            models.WallpaperLike.wallpaper_id == wallpaper.id,
            models.WallpaperLike.user_id == current_user.id
        ).first() is not None,
        "can_edit": True,
        "can_delete": True,
    }


@app.delete("/wallpapers/{wallpaper_id}")
def delete_wallpaper(wallpaper_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    wallpaper = db.query(models.Wallpaper).filter(models.Wallpaper.id == wallpaper_id).first()
    if not wallpaper:
        raise HTTPException(status_code=404, detail="Wallpaper not found")
    if not current_user.is_admin and wallpaper.uploaded_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this wallpaper")

    file_path = wallpaper.file_path
    if file_path and os.path.exists(file_path):
        os.remove(file_path)

    db.query(models.WallpaperLike).filter(models.WallpaperLike.wallpaper_id == wallpaper_id).delete()
    db.delete(wallpaper)
    db.commit()
    return {"detail": "Wallpaper deleted"}


@app.post("/wallpapers/{wallpaper_id}/like")
def like_wallpaper(wallpaper_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    wallpaper = db.query(models.Wallpaper).filter(models.Wallpaper.id == wallpaper_id).first()
    if not wallpaper:
        raise HTTPException(status_code=404, detail="Wallpaper not found")

    existing_like = db.query(models.WallpaperLike).filter(
        models.WallpaperLike.wallpaper_id == wallpaper_id,
        models.WallpaperLike.user_id == current_user.id
    ).first()
    if existing_like:
        raise HTTPException(status_code=400, detail="Wallpaper already liked")

    new_like = models.WallpaperLike(wallpaper_id=wallpaper_id, user_id=current_user.id)
    db.add(new_like)
    db.commit()
    return {"detail": "Wallpaper liked"}


@app.delete("/wallpapers/{wallpaper_id}/like")
def unlike_wallpaper(wallpaper_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    like_record = db.query(models.WallpaperLike).filter(
        models.WallpaperLike.wallpaper_id == wallpaper_id,
        models.WallpaperLike.user_id == current_user.id
    ).first()
    if not like_record:
        raise HTTPException(status_code=404, detail="Like record not found")

    db.delete(like_record)
    db.commit()
    return {"detail": "Like removed"}


@app.get("/wallpapers/{wallpaper_id}/download")
def download_wallpaper(wallpaper_id: int, db: Session = Depends(get_db)):
    wallpaper = db.query(models.Wallpaper).filter(models.Wallpaper.id == wallpaper_id).first()

    if not wallpaper:
        raise HTTPException(status_code=404, detail="Wallpaper not found")

    file_path = wallpaper.file_path

    if not file_path:
        raise HTTPException(status_code=404, detail="Wallpaper URL not found")

    # New uploads are stored in Cloudinary, so file_path is a remote URL.
    # Redirect to Cloudinary instead of checking local server files.
    if file_path.startswith("http://") or file_path.startswith("https://"):
        return RedirectResponse(url=file_path, status_code=302)

    # Backward compatibility for any old local files.
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    filename = os.path.basename(file_path)
    _, ext = os.path.splitext(filename)

    if not ext:
        ext = ".jpg"

    disp_name = (
        (wallpaper.title or filename) + ext
        if not (wallpaper.title and wallpaper.title.endswith(ext))
        else (wallpaper.title or filename)
    )

    headers = {"Content-Disposition": f'attachment; filename="{disp_name}"'}

    return FileResponse(
        file_path,
        media_type="application/octet-stream",
        filename=disp_name,
        headers=headers,
    )

# ─── BIRTHDAY ROUTES ───────────────────────────────────────

@app.get("/birthdays")
def get_birthdays(db: Session = Depends(get_db)):
    users = db.query(models.User).filter(models.User.birthday != None).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "nickname": u.nickname,
            "profile_picture": u.profile_picture,
            "birthday": u.birthday,
            "bias": u.bias
        }
        for u in users
    ]


@app.get("/birthdays/today")
def get_today_birthdays(db: Session = Depends(get_db)):
    from datetime import date

    today = date.today()
    users = db.query(models.User).filter(models.User.birthday != None).all()

    today_birthdays = [
        u for u in users
        if u.birthday and u.birthday.month == today.month and u.birthday.day == today.day
    ]

    return [
        {
            "id": u.id,
            "username": u.username,
            "nickname": u.nickname,
            "profile_picture": u.profile_picture,
            "birthday": u.birthday,
            "bias": u.bias
        }
        for u in today_birthdays
    ]

def serialize_special_day(day: models.SpecialDay, current_user: models.User):
    creator = day.created_by
    return {
        "id": day.id,
        "title": day.title,
        "date": day.date,
        "description": day.description,
        "image_url": day.image_url,
        "created_by_id": day.created_by_id,
        "created_by_username": creator.username if creator else None,
        "created_by_nickname": creator.nickname if creator else None,
        "created_at": day.created_at,
        "can_edit": bool(current_user.is_admin or day.created_by_id == current_user.id),
        "can_delete": bool(current_user.is_admin or day.created_by_id == current_user.id),
    }


@app.get("/special-days")
def get_special_days(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    days = db.query(models.SpecialDay).order_by(
        models.SpecialDay.date.asc()
    ).all()

    return [serialize_special_day(day, current_user) for day in days]


@app.post("/special-days")
def create_special_day(
    title: str = Form(...),
    date: str = Form(...),
    description: Optional[str] = Form(""),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    from datetime import date as date_class

    clean_title = title.strip()
    if not clean_title:
        raise HTTPException(status_code=400, detail="Title is required")

    image_url = None
    if file and file.filename:
        result = cloudinary.uploader.upload(file.file, folder="bts-special-days")
        image_url = result["secure_url"]

    day = models.SpecialDay(
        title=clean_title,
        date=date_class.fromisoformat(date),
        description=description or "",
        image_url=image_url,
        created_by_id=current_user.id,
    )

    db.add(day)
    db.commit()
    db.refresh(day)

    return serialize_special_day(day, current_user)


@app.put("/special-days/{day_id}")
def update_special_day(
    day_id: int,
    title: str = Form(...),
    date: str = Form(...),
    description: Optional[str] = Form(""),
    file: UploadFile = File(None),          
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    from datetime import date as date_class

    day = db.query(models.SpecialDay).filter(models.SpecialDay.id == day_id).first()
    if not day:
        raise HTTPException(status_code=404, detail="Special day not found")
    if not current_user.is_admin and day.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    day.title = title.strip()
    day.date = date_class.fromisoformat(date)
    day.description = description or ""

    
    if file and file.filename:
        result = cloudinary.uploader.upload(file.file, folder="bts-special-days")
        day.image_url = result["secure_url"]

    db.commit()
    db.refresh(day)
    return serialize_special_day(day, current_user)


@app.delete("/special-days/{day_id}")
def delete_special_day(
    day_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    day = db.query(models.SpecialDay).filter(models.SpecialDay.id == day_id).first()

    if not day:
        raise HTTPException(status_code=404, detail="Special day not found")

    if not current_user.is_admin and day.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this special day")

    db.delete(day)
    db.commit()

    return {"detail": "Special day deleted"}

    # ─── MEMBERS ROUTE ─────────────────────────────────────────

@app.get("/members")
def get_members(db: Session = Depends(get_db)):
    users = db.query(models.User).order_by(models.User.created_at.desc()).all()
    return [
        {
    "id": u.id,
    "username": u.username,
    "nickname": u.nickname,
    "profile_picture": u.profile_picture,
    "country": u.country,
    "bias": u.bias,
    "is_admin": u.is_admin,
    "created_at": u.created_at,
}
        for u in users
    ]

# ─── SINGALONG ROUTES ──────────────────────────────────────

@app.post("/songs")
def create_song(song: schemas.SongCreate, db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)):
    data = song.model_dump()
    if not data.get("album_id") and data.get("album"):
        album = db.query(models.Album).filter(models.Album.name == data.get("album")).first()
        if album:
            data["album_id"] = album.id
    new_song = models.Song(**data, added_by_id=current_user.id)
    db.add(new_song)
    db.commit()
    db.refresh(new_song)
    return serialize_song(new_song, current_user, db)

@app.get("/songs")
def get_songs(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    seed_albums(db)
    songs = db.query(models.Song).order_by(models.Song.created_at.desc()).all()
    return [serialize_song(song, current_user, db) for song in songs]

@app.post("/songs/{song_id}/favorite")
def favorite_song(song_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    existing = db.query(models.SongFavorite).filter(
        models.SongFavorite.song_id == song_id,
        models.SongFavorite.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Song already favorited")

    favorite = models.SongFavorite(song_id=song_id, user_id=current_user.id)
    db.add(favorite)
    db.commit()
    return serialize_song(song, current_user, db)

@app.delete("/songs/{song_id}/favorite")
def unfavorite_song(song_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    favorite = db.query(models.SongFavorite).filter(
        models.SongFavorite.song_id == song_id,
        models.SongFavorite.user_id == current_user.id
    ).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")

    db.delete(favorite)
    db.commit()

    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return serialize_song(song, current_user, db)

@app.put("/songs/{song_id}")
def update_song(song_id: int, song_data: schemas.SongUpdate, db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)):
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    if not current_user.is_admin and song.added_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this song")

    update_data = song_data.model_dump(exclude_unset=True)
    if not update_data.get("album_id") and update_data.get("album"):
        album = db.query(models.Album).filter(models.Album.name == update_data.get("album")).first()
        if album:
            update_data["album_id"] = album.id
    for key, value in update_data.items():
        setattr(song, key, value)

    db.commit()
    db.refresh(song)
    return serialize_song(song, current_user, db)

@app.delete("/songs/{song_id}")
def delete_song(song_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete songs")

    db.query(models.SongFavorite).filter(models.SongFavorite.song_id == song_id).delete()
    db.delete(song)
    db.commit()
    return {"detail": "Song deleted"}


# ─── ALBUM ROUTES ──────────────────────────────────────────

@app.get("/albums")
def get_albums(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    seed_albums(db)
    albums = db.query(models.Album).order_by(models.Album.year.desc(), models.Album.name.asc()).all()
    return [serialize_album(album, current_user) for album in albums]

@app.post("/albums")
def create_album(
    name: str = Form(...),
    artist: str = Form(...),
    year: Optional[int] = Form(None),
    album_type: str = Form("BTS"),
    playlist_url: Optional[str] = Form(""),
    image_url: Optional[str] = Form(""),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    album = models.Album(
        name=name,
        artist=artist,
        year=year,
        album_type=album_type,
        playlist_url=playlist_url or "",
        image_url=image_url or "",
        created_by_id=current_user.id,
    )
    db.add(album)
    db.commit()
    db.refresh(album)

    if file and file.filename:
        result = cloudinary.uploader.upload(file.file, folder="albums")
        album.image_url = result["secure_url"]
        db.commit()
        db.refresh(album)

    return serialize_album(album, current_user)

@app.put("/albums/{album_id}")
def update_album(
    album_id: int,
    name: str = Form(...),
    artist: str = Form(...),
    year: Optional[int] = Form(None),
    album_type: str = Form("BTS"),
    playlist_url: Optional[str] = Form(""),
    image_url: Optional[str] = Form(""),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    album = db.query(models.Album).filter(models.Album.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    if not current_user.is_admin and album.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this album")

    album.name = name
    album.artist = artist
    album.year = year
    album.album_type = album_type
    album.playlist_url = playlist_url or ""
    album.image_url = image_url or album.image_url or ""

    if file and file.filename:
        result = cloudinary.uploader.upload(file.file, folder="albums")
        album.image_url = result["secure_url"]

    db.commit()
    db.refresh(album)

    # Keep songs connected when album name/year changes.
    db.query(models.Song).filter(models.Song.album_id == album.id).update({
        models.Song.album: album.name,
        models.Song.release_year: album.year,
        models.Song.song_type: album.album_type,
    }, synchronize_session=False)
    db.commit()

    return serialize_album(album, current_user)

@app.delete("/albums/{album_id}")
def delete_album(album_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete albums")

    album = db.query(models.Album).filter(models.Album.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")

    if album.image_url and album.image_url.startswith("uploads/") and os.path.exists(album.image_url):
        os.remove(album.image_url)

    # Do not delete songs automatically; just disconnect them.
    db.query(models.Song).filter(models.Song.album_id == album.id).update({models.Song.album_id: None}, synchronize_session=False)
    db.delete(album)
    db.commit()
    return {"detail": "Album deleted"}

# ─── SOLO ALBUM ROUTES ─────────────────────────────────────

@app.get("/solo-albums")
def get_solo_albums(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    seed_solo_albums(db)
    albums = db.query(models.SoloAlbum).order_by(models.SoloAlbum.artist.asc(), models.SoloAlbum.year.desc()).all()
    return [serialize_solo_album(album) for album in albums]

@app.put("/solo-albums/{album_id}")
def update_solo_album(
    album_id: int,
    name: str = Form(...),
    artist: str = Form(...),
    year: Optional[int] = Form(None),
    youtube_url: Optional[str] = Form(""),
    image_url: Optional[str] = Form(""),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admins only")

    album = db.query(models.SoloAlbum).filter(models.SoloAlbum.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Solo album not found")

    album.name = name
    album.artist = artist
    album.year = year
    album.youtube_url = youtube_url or ""
    album.image_url = image_url or album.image_url or ""

    if file and file.filename:
        result = cloudinary.uploader.upload(file.file, folder="solo-albums")
        album.image_url = result["secure_url"]

    db.commit()
    db.refresh(album)
    return serialize_solo_album(album)

@app.delete("/solo-albums/{album_id}")
def delete_solo_album(album_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admins only")

    album = db.query(models.SoloAlbum).filter(models.SoloAlbum.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Solo album not found")

    if album.image_url and album.image_url.startswith("uploads/") and os.path.exists(album.image_url):
        os.remove(album.image_url)

    db.delete(album)
    db.commit()
    return {"detail": "Solo album deleted"}

# ─── EDIT PROFILE ──────────────────────────────────────────

class ProfileUpdate(BaseModel):
    nickname: Optional[str] = None
    bias: Optional[str] = None
    country: Optional[str] = None
    birthday: Optional[str] = None

@app.put("/auth/profile")
def update_profile(
    nickname: str = Form(None),
    bias: str = Form(None),
    country: str = Form(None),
    birthday: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if nickname is not None:
        current_user.nickname = nickname

    if bias is not None:
        current_user.bias = bias

    if country is not None:
        current_user.country = country

    if birthday:
        from datetime import date
        current_user.birthday = date.fromisoformat(birthday)

    if file and file.filename:
        result = cloudinary.uploader.upload(file.file, folder="profiles")
        current_user.profile_picture = result["secure_url"]

    db.commit()
    db.refresh(current_user)

    return current_user

# ─── BIRTHDAY POSTS & COMMENTS ─────────────────────────────

@app.get("/birthday-posts")
def get_birthday_posts(db: Session = Depends(get_db)):
    posts = db.query(models.BirthdayPost).order_by(
        models.BirthdayPost.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "message": p.message,
            "image_path": p.image_path,
            "for_username": p.for_username,
            "posted_by": p.posted_by.username,
            "created_at": p.created_at,
            "comments": [
                {
                    "id": c.id,
                    "content": c.content,
                    "owner": c.owner.username,
                    "created_at": c.created_at
                }
                for c in p.comments
            ]
        }
        for p in posts
    ]

@app.post("/birthday-posts")
def create_birthday_post(
    for_username: str = Form(...),
    message: str = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    image_path = None
    if file and file.filename:
        image_path = f"uploads/{file.filename}"
        result = cloudinary.uploader.upload(file.file, folder="birthday-posts")
        image_path = result["secure_url"]

    post = models.BirthdayPost(
        message=message,
        image_path=image_path,
        for_username=for_username,
        posted_by_id=current_user.id
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

@app.post("/birthday-comments/{post_id}")
def add_comment(
    post_id: int,
    content: str = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    comment = models.BirthdayComment(
        content=content,
        post_id=post_id,
        owner_id=current_user.id
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return {"id": comment.id, "content": comment.content,
            "owner": current_user.username, "created_at": comment.created_at}




# ─── BTS MEMBER DESCRIPTIONS ROUTES ────────────────────────

def serialize_bts_member_description(desc: models.BtsMemberDescription, current_user: models.User):
    creator = desc.created_by
    return {
        "id": desc.id,
        "member_name": desc.member_name,
        "content": desc.content,
        "created_by_id": desc.created_by_id,
        "created_by_username": creator.username if creator else None,
        "created_by_nickname": creator.nickname if creator else None,
        "created_by_profile_picture": creator.profile_picture if creator else None,
        "created_at": desc.created_at,
        "can_edit": bool(current_user and (current_user.is_admin or desc.created_by_id == current_user.id)),
        "can_delete": bool(current_user and current_user.is_admin),
    }

@app.get("/bts-descriptions")
def get_bts_descriptions(
    member_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.BtsMemberDescription)

    if member_name:
        query = query.filter(models.BtsMemberDescription.member_name == member_name)

    descriptions = query.order_by(models.BtsMemberDescription.created_at.desc()).all()

    return [
        serialize_bts_member_description(desc, current_user)
        for desc in descriptions
    ]

@app.post("/bts-descriptions")
def create_bts_description(
    member_name: str = Form(...),
    content: str = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    clean_member = member_name.strip()
    clean_content = content.strip()

    if not clean_member:
        raise HTTPException(status_code=400, detail="Member name is required")
    if not clean_content:
        raise HTTPException(status_code=400, detail="Description is required")

    desc = models.BtsMemberDescription(
        member_name=clean_member,
        content=clean_content,
        created_by_id=current_user.id,
    )

    db.add(desc)
    db.commit()
    db.refresh(desc)

    return serialize_bts_member_description(desc, current_user)

@app.put("/bts-descriptions/{description_id}")
def update_bts_description(
    description_id: int,
    content: str = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    desc = db.query(models.BtsMemberDescription).filter(
        models.BtsMemberDescription.id == description_id
    ).first()

    if not desc:
        raise HTTPException(status_code=404, detail="Description not found")

    if not current_user.is_admin and desc.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this description")

    clean_content = content.strip()
    if not clean_content:
        raise HTTPException(status_code=400, detail="Description is required")

    desc.content = clean_content
    db.commit()
    db.refresh(desc)

    return serialize_bts_member_description(desc, current_user)

@app.delete("/bts-descriptions/{description_id}")
def delete_bts_description(
    description_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    desc = db.query(models.BtsMemberDescription).filter(
        models.BtsMemberDescription.id == description_id
    ).first()

    if not desc:
        raise HTTPException(status_code=404, detail="Description not found")

    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admins only")

    db.delete(desc)
    db.commit()

    return {"detail": "Description deleted"}



# ─── BTS MAIN DESCRIPTION SETTINGS ─────────────────────────

@app.get("/bts-main-descriptions")
def get_bts_main_descriptions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    rows = db.execute(
        text("SELECT key, value FROM app_settings WHERE key LIKE 'bts_main_desc_%'")
    ).fetchall()

    result = {}
    for row in rows:
        member_name = row.key.replace("bts_main_desc_", "", 1)
        result[member_name] = row.value

    return result


@app.put("/bts-main-descriptions/{member_name}")
def update_bts_main_description(
    member_name: str,
    content: str = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admins only")

    clean_member = member_name.strip()
    clean_content = content.strip()

    if not clean_member:
        raise HTTPException(status_code=400, detail="Member name is required")

    if not clean_content:
        raise HTTPException(status_code=400, detail="Description is required")

    key = f"bts_main_desc_{clean_member}"

    existing = db.execute(
        text("SELECT key FROM app_settings WHERE key = :key"),
        {"key": key},
    ).first()

    if existing:
        db.execute(
            text("""
                UPDATE app_settings
                SET value = :value
                WHERE key = :key
            """),
            {"key": key, "value": clean_content},
        )
    else:
        db.execute(
            text("""
                INSERT INTO app_settings (key, value)
                VALUES (:key, :value)
            """),
            {"key": key, "value": clean_content},
        )

    db.commit()

    return {"member_name": clean_member, "content": clean_content}

# ─── QUIZ ROUTES ───────────────────────────────────────────

DEFAULT_QUIZ_TOPICS = [
    {"name": "Guess the BTS Member by Eyes", "icon": "👀", "category": "eyes"},
    {"name": "Guess the BTS Member by Lips", "icon": "💋", "category": "lips"},
    {"name": "BTS Knowledge Challenge", "icon": "🎤", "category": "knowledge"},
]

def seed_quiz_topics(db: Session):
    """Seed default quiz topics only once.

    Important:
    - This function runs on backend startup only.
    - After first seed, deleting default topics will NOT recreate them.
    - Existing old category-based questions are linked to the default topics during the first seed.
    """
    seeded = db.execute(
        text("SELECT value FROM app_settings WHERE key = 'quiz_default_topics_seeded'")
    ).first()

    if seeded:
        return

    for item in DEFAULT_QUIZ_TOPICS:
        topic = db.query(models.QuizTopic).filter(
            models.QuizTopic.name == item["name"]
        ).first()

        if not topic:
            topic = models.QuizTopic(
                name=item["name"],
                icon=item["icon"],
                created_by_id=None,
            )
            db.add(topic)
            db.commit()
            db.refresh(topic)

        db.query(models.QuizQuestion).filter(
            models.QuizQuestion.topic_id == None,
            models.QuizQuestion.category == item["category"],
        ).update(
            {models.QuizQuestion.topic_id: topic.id},
            synchronize_session=False,
        )
        db.commit()

    existing = db.execute(
        text("SELECT key FROM app_settings WHERE key = 'quiz_default_topics_seeded'")
    ).first()

    if existing:
        db.execute(
            text("""
                UPDATE app_settings
                SET value = 'true'
                WHERE key = 'quiz_default_topics_seeded'
            """)
        )
    else:
        db.execute(
            text("""
                INSERT INTO app_settings (key, value)
                VALUES ('quiz_default_topics_seeded', 'true')
            """)
        )

    db.commit()

def serialize_quiz_topic(topic: models.QuizTopic, current_user: models.User, db: Session):
    return {
        "id": topic.id,
        "name": topic.name,
        "icon": topic.icon or "📚",
        "created_by_id": topic.created_by_id,
        "created_by_username": topic.created_by.username if topic.created_by else "System",
        "created_at": topic.created_at,
        "question_count": db.query(models.QuizQuestion).filter(models.QuizQuestion.topic_id == topic.id).count(),
        "can_edit": bool(current_user and (current_user.is_admin or topic.created_by_id == current_user.id)),
        "can_delete": bool(current_user and current_user.is_admin),
    }

def serialize_quiz_question(q: models.QuizQuestion, current_user: models.User):
    return {
        "id": q.id,
        "category": q.category or "custom",
        "topic_id": q.topic_id,
        "topic_name": q.topic.name if q.topic else None,
        "topic_icon": q.topic.icon if q.topic else None,
        "question": q.question,
        "image_url": q.image_url,
        "option_a": q.option_a,
        "option_b": q.option_b,
        "option_c": q.option_c,
        "option_d": q.option_d,
        "correct_answer": q.correct_answer,
        "created_by_id": q.created_by_id,
        "created_by_username": q.created_by.username if q.created_by else None,
        "created_at": q.created_at,
        "can_edit": bool(current_user and (current_user.is_admin or q.created_by_id == current_user.id)),
        "can_delete": bool(current_user and current_user.is_admin),
    }

@app.on_event("startup")
def startup_seed():
    db = next(get_db())
    try:
        seed_quiz_topics(db)
    finally:
        db.close()

@app.get("/quiz/topics")
def get_quiz_topics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    topics = db.query(models.QuizTopic)\
        .order_by(models.QuizTopic.created_at.asc())\
        .all()

    return [
        serialize_quiz_topic(t, current_user, db)
        for t in topics
    ]

@app.post("/quiz/topics")
def create_quiz_topic(
    name: str = Form(...),
    icon: Optional[str] = Form("📚"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    clean_name = name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Topic name is required")
    existing = db.query(models.QuizTopic).filter(models.QuizTopic.name == clean_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Topic already exists")
    topic = models.QuizTopic(name=clean_name, icon=icon or "📚", created_by_id=current_user.id)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return serialize_quiz_topic(topic, current_user, db)

@app.put("/quiz/topics/{topic_id}")
def update_quiz_topic(
    topic_id: int,
    name: str = Form(...),
    icon: Optional[str] = Form("📚"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    topic = db.query(models.QuizTopic).filter(models.QuizTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    if not current_user.is_admin and topic.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this topic")
    topic.name = name.strip()
    topic.icon = icon or "📚"
    db.commit()
    db.refresh(topic)
    return serialize_quiz_topic(topic, current_user, db)

@app.delete("/quiz/topics/{topic_id}")
def delete_quiz_topic(topic_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admins only")
    topic = db.query(models.QuizTopic).filter(models.QuizTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    db.delete(topic)
    db.commit()
    return {"detail": "Topic deleted"}

@app.get("/quiz/questions")
def get_quiz_questions(
    topic_id: Optional[int] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.QuizQuestion)

    if topic_id:
        query = query.filter(
            models.QuizQuestion.topic_id == topic_id
        )
    elif category and category != "all":
        query = query.filter(
            models.QuizQuestion.category == category
        )

    questions = query.order_by(
        models.QuizQuestion.created_at.asc()
    ).all()

    return [
        serialize_quiz_question(q, current_user)
        for q in questions
    ]

@app.post("/quiz/questions")
def create_quiz_question(
    topic_id: int = Form(...),
    question: str = Form(...),
    option_a: str = Form(...),
    option_b: str = Form(...),
    option_c: str = Form(...),
    option_d: str = Form(...),
    correct_answer: str = Form(...),
    image_url: Optional[str] = Form(""),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    topic = db.query(models.QuizTopic).filter(models.QuizTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    new_question = models.QuizQuestion(
        topic_id=topic.id,
        category="custom",
        question=question,
        option_a=option_a,
        option_b=option_b,
        option_c=option_c,
        option_d=option_d,
        correct_answer=correct_answer,
        image_url=image_url or "",
        created_by_id=current_user.id,
    )
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    if file and file.filename:
        result = cloudinary.uploader.upload(file.file, folder="quiz")
        new_question.image_url = result["secure_url"]
        db.commit()
        db.refresh(new_question)
    return serialize_quiz_question(new_question, current_user)

@app.put("/quiz/questions/{question_id}")
def update_quiz_question(
    question_id: int,
    topic_id: int = Form(...),
    question: str = Form(...),
    option_a: str = Form(...),
    option_b: str = Form(...),
    option_c: str = Form(...),
    option_d: str = Form(...),
    correct_answer: str = Form(...),
    image_url: Optional[str] = Form(""),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    quiz_question = db.query(models.QuizQuestion).filter(models.QuizQuestion.id == question_id).first()
    if not quiz_question:
        raise HTTPException(status_code=404, detail="Question not found")
    if not current_user.is_admin and quiz_question.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this question")
    topic = db.query(models.QuizTopic).filter(models.QuizTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    quiz_question.topic_id = topic.id
    quiz_question.question = question
    quiz_question.option_a = option_a
    quiz_question.option_b = option_b
    quiz_question.option_c = option_c
    quiz_question.option_d = option_d
    quiz_question.correct_answer = correct_answer
    quiz_question.image_url = image_url or quiz_question.image_url or ""
    if file and file.filename:
        result = cloudinary.uploader.upload(file.file, folder="quiz")
        quiz_question.image_url = result["secure_url"]
    db.commit()
    db.refresh(quiz_question)
    return serialize_quiz_question(quiz_question, current_user)

@app.delete("/quiz/questions/{question_id}")
def delete_quiz_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admins only")
    quiz_question = db.query(models.QuizQuestion).filter(models.QuizQuestion.id == question_id).first()
    if not quiz_question:
        raise HTTPException(status_code=404, detail="Question not found")
    if quiz_question.image_url and quiz_question.image_url.startswith("uploads/") and os.path.exists(quiz_question.image_url):
        os.remove(quiz_question.image_url)
    db.delete(quiz_question)
    db.commit()
    return {"detail": "Question deleted"}


# ─── QUIZ LEADERBOARD ROUTES ───────────────────────────────

def serialize_quiz_score_row(row):
    percent = 0
    if row.total_questions:
        percent = round((row.score / row.total_questions) * 100)

    return {
        "id": row.id,
        "user_id": row.user_id,
        "username": row.username,
        "nickname": row.nickname,
        "profile_picture": row.profile_picture,
        "topic_id": row.topic_id,
        "topic_name": row.topic_name,
        "topic_icon": row.topic_icon,
        "score": row.score,
        "total_questions": row.total_questions,
        "percentage": percent,
        "created_at": row.created_at,
    }


@app.post("/quiz/scores")
def save_quiz_score(
    topic_id: int,
    score: int,
    total_questions: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    from datetime import datetime
    topic = db.query(models.QuizTopic).filter(models.QuizTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    if total_questions <= 0:
        raise HTTPException(status_code=400, detail="Total questions must be greater than 0")

    if score < 0 or score > total_questions:
        raise HTTPException(status_code=400, detail="Invalid score")

    existing_score = db.query(models.QuizScore).filter(
        models.QuizScore.user_id == current_user.id,
        models.QuizScore.topic_id == topic_id
    ).first()

    if existing_score:
        new_percent = score / total_questions
        old_percent = existing_score.score / existing_score.total_questions
        if new_percent > old_percent or (abs(new_percent - old_percent) < 1e-9 and score > existing_score.score):
            existing_score.score = score
            existing_score.total_questions = total_questions
            existing_score.created_at = datetime.utcnow()
            db.commit()
    else:
        new_score = models.QuizScore(
            user_id=current_user.id,
            topic_id=topic_id,
            score=score,
            total_questions=total_questions,
            created_at=datetime.utcnow()
        )
        db.add(new_score)
        db.commit()

    return {"detail": "Score saved"}


@app.get("/quiz/leaderboard")
def get_quiz_leaderboard(
    topic_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    limit = max(1, min(limit, 100))

    query = """
        SELECT
            qs.id,
            qs.user_id,
            qs.topic_id,
            qs.score,
            qs.total_questions,
            qs.created_at,
            u.username,
            u.nickname,
            u.profile_picture,
            qt.name AS topic_name,
            qt.icon AS topic_icon
        FROM quiz_scores qs
        JOIN users u ON u.id = qs.user_id
        JOIN quiz_topics qt ON qt.id = qs.topic_id
    """

    params = {"limit": limit}

    if topic_id:
        query += " WHERE qs.topic_id = :topic_id"
        params["topic_id"] = topic_id

    query += """
        ORDER BY
            CAST(qs.score AS FLOAT) / qs.total_questions DESC,
            qs.score DESC,
            qs.total_questions DESC,
            qs.created_at ASC
        LIMIT :limit
    """

    rows = db.execute(text(query), params).fetchall()

    return [serialize_quiz_score_row(row) for row in rows]


@app.get("/quiz/my-scores")
def get_my_quiz_scores(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    rows = db.execute(
        text("""
            SELECT
                qs.id,
                qs.user_id,
                qs.topic_id,
                qs.score,
                qs.total_questions,
                qs.created_at,
                u.username,
                u.nickname,
                u.profile_picture,
                qt.name AS topic_name,
                qt.icon AS topic_icon
            FROM quiz_scores qs
            JOIN users u ON u.id = qs.user_id
            JOIN quiz_topics qt ON qt.id = qs.topic_id
            WHERE qs.user_id = :user_id
            ORDER BY qs.created_at DESC
            LIMIT 50
        """),
        {"user_id": current_user.id},
    ).fetchall()

    return [serialize_quiz_score_row(row) for row in rows]

