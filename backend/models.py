from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="agent", nullable=False) # admin, agent
    photo_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    begin_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    transactions = relationship("PointsTransaction", back_populates="agent")

class PointType(Base):
    __tablename__ = "point_types"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, index=True, nullable=False) # e.g. Venta, Renta
    points_value = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)

    transactions = relationship("PointsTransaction", back_populates="point_type")

class PointsTransaction(Base):
    __tablename__ = "points_transactions"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("users.id"))
    point_type_id = Column(Integer, ForeignKey("point_types.id"))
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    notes = Column(String, nullable=True)

    agent = relationship("User", back_populates="transactions")
    point_type = relationship("PointType", back_populates="transactions")
