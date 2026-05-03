from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import database, schemas, models, auth

router = APIRouter(prefix="/points", tags=["Points"])

# POINT TYPES
@router.get("/types", response_model=list[schemas.PointTypeResponse])
def get_point_types(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    types = db.query(models.PointType).offset(skip).limit(limit).all()
    return types

@router.post("/types", response_model=schemas.PointTypeResponse)
def create_point_type(type_in: schemas.PointTypeCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    db_type = models.PointType(**type_in.model_dump())
    db.add(db_type)
    db.commit()
    db.refresh(db_type)
    return db_type

@router.put("/types/{type_id}", response_model=schemas.PointTypeResponse)
def update_point_type(type_id: int, type_in: schemas.PointTypeUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    db_type = db.query(models.PointType).filter(models.PointType.id == type_id).first()
    if not db_type:
        raise HTTPException(status_code=404, detail="Type not found")
    
    update_data = type_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_type, key, value)
    
    db.commit()
    db.refresh(db_type)
    return db_type

@router.delete("/types/{type_id}", status_code=204)
def delete_point_type(type_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    db_type = db.query(models.PointType).filter(models.PointType.id == type_id).first()
    if not db_type:
        raise HTTPException(status_code=404, detail="Type not found")
    db_type.is_active = False
    db.commit()
    return

# TRANSACTIONS
@router.post("/transactions", response_model=schemas.PointsTransactionResponse)
def assign_points(tx_in: schemas.PointsTransactionCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    db_tx = models.PointsTransaction(**tx_in.model_dump())
    db.add(db_tx)
    db.commit()
    db.refresh(db_tx)
    return db_tx

@router.get("/transactions", response_model=list[schemas.PointsTransactionResponse])
def get_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    # if agent, only see own transactions
    if current_user.role == "agent":
        txs = db.query(models.PointsTransaction).filter(models.PointsTransaction.agent_id == current_user.id).offset(skip).limit(limit).all()
    else:
        txs = db.query(models.PointsTransaction).offset(skip).limit(limit).all()
    return txs
