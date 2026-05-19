from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import Optional
import shutil
import os

from .database import engine, get_db
from . import models, schemas, auth

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Purple Family API 💜")

# CORS - allows React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for wallpapers
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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
    return db.query(models.Post).order_by(models.Post.created_at.desc()).all()

# ─── WALLPAPER ROUTES ──────────────────────────────────────

@app.post("/wallpapers")
def upload_wallpaper(
    title: str = Form(...),
    member: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admins only")
    
    file_path = f"uploads/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    wallpaper = models.Wallpaper(
        title=title,
        file_path=file_path,
        member=member,
        uploaded_by_id=current_user.id
    )
    db.add(wallpaper)
    db.commit()
    db.refresh(wallpaper)
    return wallpaper

@app.get("/wallpapers")
def get_wallpapers(db: Session = Depends(get_db)):
    return db.query(models.Wallpaper).order_by(models.Wallpaper.created_at.desc()).all()

# ─── BIRTHDAY ROUTES ───────────────────────────────────────

@app.get("/birthdays")
def get_birthdays(db: Session = Depends(get_db)):
    users = db.query(models.User).filter(models.User.birthday != None).all()
    return [{"username": u.username, "birthday": u.birthday, "bias": u.bias} for u in users]