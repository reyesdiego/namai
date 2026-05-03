from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# User
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = "agent"
    begin_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    begin_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class UserResponse(UserBase):
    id: int
    photo_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Point Type
class PointTypeBase(BaseModel):
    description: str
    points_value: int

class PointTypeCreate(PointTypeBase):
    pass

class PointTypeUpdate(BaseModel):
    description: Optional[str] = None
    points_value: Optional[int] = None
    is_active: Optional[bool] = None

class PointTypeResponse(PointTypeBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

# Points Transaction
class PointsTransactionBase(BaseModel):
    point_type_id: int
    notes: Optional[str] = None

class PointsTransactionCreate(PointsTransactionBase):
    agent_id: int

class PointsTransactionResponse(PointsTransactionBase):
    id: int
    agent_id: int
    date: datetime
    point_type: PointTypeResponse

    class Config:
        from_attributes = True
