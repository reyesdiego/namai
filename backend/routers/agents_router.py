import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
import database, schemas, models, auth

router = APIRouter(prefix="/agents", tags=["Agents"])

@router.get("/", response_model=list[schemas.UserResponse])
def read_agents(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    # Both admin and agent can see agents (e.g. for the big board)
    users = db.query(models.User).filter(models.User.role == "agent").offset(skip).limit(limit).all()
    return users

@router.post("/", response_model=schemas.UserResponse)
def create_agent(
    email: str = Form(...),
    name: str = Form(...),
    password: str = Form(...),
    begin_date: str = Form(None),
    end_date: str = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    photo_url = None
    if photo:
        file_location = f"uploads/{photo.filename}"
        with open(file_location, "wb+") as file_object:
            file_object.write(photo.file.read())
        photo_url = f"/{file_location}"

    begin_dt = None
    end_dt = None
    if begin_date and begin_date != 'null':
        begin_dt = datetime.fromisoformat(begin_date.replace("Z", "+00:00"))
    if end_date and end_date != 'null':
        end_dt = datetime.fromisoformat(end_date.replace("Z", "+00:00"))

    hashed_password = auth.get_password_hash(password)
    db_user = models.User(
        email=email,
        name=name,
        hashed_password=hashed_password,
        role="agent",
        photo_url=photo_url,
        begin_date=begin_dt,
        end_date=end_dt
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}", status_code=204)
def delete_agent(user_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    user = db.query(models.User).filter(models.User.id == user_id, models.User.role == "agent").first()
    if not user:
        raise HTTPException(status_code=404, detail="Agent not found")
    user.is_active = False # Soft delete
    db.commit()
    return

@router.patch("/{user_id}", response_model=schemas.UserResponse)
def update_agent(
    user_id: int,
    email: str = Form(None),
    name: str = Form(None),
    password: str = Form(None),
    begin_date: str = Form(None),
    end_date: str = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    user = db.query(models.User).filter(models.User.id == user_id, models.User.role == "agent").first()
    if not user:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if email:
        db_user = db.query(models.User).filter(models.User.email == email, models.User.id != user_id).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        user.email = email
        
    if name:
        user.name = name
        
    if password:
        user.hashed_password = auth.get_password_hash(password)
        
    if begin_date is not None:
        if begin_date == 'null' or begin_date == '':
            user.begin_date = None
        else:
            user.begin_date = datetime.fromisoformat(begin_date.replace("Z", "+00:00"))
            
    if end_date is not None:
        if end_date == 'null' or end_date == '':
            user.end_date = None
        else:
            user.end_date = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            
    if photo:
        file_location = f"uploads/{photo.filename}"
        with open(file_location, "wb+") as file_object:
            file_object.write(photo.file.read())
        user.photo_url = f"/{file_location}"
        
    db.commit()
    db.refresh(user)
    return user
