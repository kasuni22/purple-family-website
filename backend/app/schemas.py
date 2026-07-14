from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional

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
    nickname: Optional[str] = None
    profile_picture: Optional[str] = None
    birthday: Optional[date] = None
    country: Optional[str] = None
    bias: Optional[str] = None
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

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

class AlbumOut(BaseModel):
    id: int
    name: str
    artist: str
    year: Optional[int] = None
    album_type: str
    image_url: Optional[str] = None
    playlist_url: Optional[str] = None
    created_by_id: Optional[int] = None
    created_by_username: Optional[str] = None
    created_at: datetime
    can_edit: bool = False
    can_delete: bool = False

    class Config:
        from_attributes = True

class SongCreate(BaseModel):
    title: str
    artist: str
    lyrics: str
    youtube_url: str
    release_year: Optional[int] = None
    album: Optional[str] = None
    album_id: Optional[int] = None
    song_type: Optional[str] = None
    solo_artist: Optional[str] = None
    image_url: Optional[str] = None

class SongUpdate(BaseModel):
    title: Optional[str] = None
    artist: Optional[str] = None
    lyrics: Optional[str] = None
    youtube_url: Optional[str] = None
    release_year: Optional[int] = None
    album: Optional[str] = None
    album_id: Optional[int] = None
    song_type: Optional[str] = None
    solo_artist: Optional[str] = None
    image_url: Optional[str] = None

class SoloAlbumOut(BaseModel):
    id: int
    name: str
    artist: str
    year: Optional[int] = None
    image_url: Optional[str] = None
    youtube_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class QuizQuestionOut(BaseModel):
    id: int
    category: Optional[str] = None
    topic_id: Optional[int] = None
    topic_name: Optional[str] = None
    topic_icon: Optional[str] = None
    question: str
    image_url: Optional[str] = None
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str
    created_by_id: Optional[int] = None
    created_by_username: Optional[str] = None
    created_at: datetime
    can_edit: bool = False
    can_delete: bool = False

    class Config:
        from_attributes = True


class QuizTopicOut(BaseModel):
    id: int
    name: str
    icon: Optional[str] = None
    created_by_id: Optional[int] = None
    created_by_username: Optional[str] = None
    created_at: datetime
    question_count: int = 0
    can_edit: bool = False
    can_delete: bool = False

    class Config:
        from_attributes = True


class BtsMemberDescriptionOut(BaseModel):
    id: int
    member_name: str
    content: str
    created_by_id: int
    created_by_username: Optional[str] = None
    created_by_nickname: Optional[str] = None
    created_by_profile_picture: Optional[str] = None
    created_at: datetime
    can_edit: bool = False
    can_delete: bool = False

    class Config:
        from_attributes = True

class SpecialDayOut(BaseModel):
    id: int
    title: str
    date: date
    description: Optional[str] = None
    created_by_id: int
    created_by_username: Optional[str] = None
    created_by_nickname: Optional[str] = None
    created_at: datetime
    can_edit: bool = False
    can_delete: bool = False

    class Config:
        from_attributes = True


class BtsEventOut(BaseModel):
    id: int
    name: str
    month: int
    day: int
    image_url: Optional[str] = None
    is_special: bool = False
    is_default: bool = False
    created_by_id: Optional[int] = None
    created_at: datetime
    can_edit: bool = False
    can_delete: bool = False

    class Config:
        from_attributes = True


class WallpaperUpdate(BaseModel):
    title: Optional[str] = None
    member: Optional[str] = None
