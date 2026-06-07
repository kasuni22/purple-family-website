from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    birthday = Column(Date, nullable=True)
    country = Column(String, nullable=True)
    bias = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    posts = relationship("Post", back_populates="owner")
    wallpapers = relationship("Wallpaper", back_populates="uploaded_by")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())

    owner = relationship("User", back_populates="posts")

class Wallpaper(Base):
    __tablename__ = "wallpapers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    file_path = Column(String)
    member = Column(String, nullable=True)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())

    uploaded_by = relationship("User", back_populates="wallpapers")

class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    artist = Column(String)
    lyrics = Column(String)
    youtube_url = Column(String)
    added_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())

class BirthdayPost(Base):
    __tablename__ = "birthday_posts"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String)
    image_path = Column(String, nullable=True)
    for_username = Column(String)
    posted_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())

    posted_by = relationship("User", foreign_keys=[posted_by_id])
    comments = relationship("BirthdayComment", back_populates="post")

class BirthdayComment(Base):
    __tablename__ = "birthday_comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    post_id = Column(Integer, ForeignKey("birthday_posts.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())

    post = relationship("BirthdayPost", back_populates="comments")
    owner = relationship("User", foreign_keys=[owner_id])