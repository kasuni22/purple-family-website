from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional

# User schemas
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    birthday: Optional[date] = None
    country: Optional[str] = None
    bias: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    birthday: Optional[date] = None
    country: Optional[str] = None
    bias: Optional[str] = None
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

# Post schemas
class PostCreate(BaseModel):
    title: str
    content: str

class PostOut(BaseModel):
    id: int
    title: str
    content: str
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Wallpaper schemas
class WallpaperOut(BaseModel):
    id: int
    title: str
    file_path: str
    member: Optional[str] = None
    created_at: datetime
    uploaded_by_id: int
    uploaded_by_username: str
    likes_count: int
    liked_by_current_user: bool

    class Config:
        from_attributes = True

class SongCreate(BaseModel):
    title: str
    artist: str
    lyrics: str
    youtube_url: str        