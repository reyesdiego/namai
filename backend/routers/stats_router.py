from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import database, models, auth

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("/ranking")
def get_ranking(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    # Calculate total points per agent
    results = (
        db.query(
            models.User.id,
            models.User.name,
            models.User.photo_url,
            func.sum(models.PointType.points_value).label("total_points")
        )
        .join(models.PointsTransaction, models.User.id == models.PointsTransaction.agent_id)
        .join(models.PointType, models.PointsTransaction.point_type_id == models.PointType.id)
        .filter(models.User.role == "agent")
        .group_by(models.User.id)
        .order_by(func.sum(models.PointType.points_value).desc())
        .all()
    )

    ranking = []
    for r in results:
        ranking.append({
            "id": r.id,
            "name": r.name,
            "photo_url": r.photo_url,
            "total_points": r.total_points or 0
        })
    return ranking

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    # Activity distribution (Pie chart data) e.g., how many points came from Rentas vs Ventas (global or per user)
    query = db.query(
        models.PointType.description,
        func.sum(models.PointType.points_value).label("total_value")
    ).join(models.PointsTransaction, models.PointsTransaction.point_type_id == models.PointType.id)

    if current_user.role == "agent":
        query = query.filter(models.PointsTransaction.agent_id == current_user.id)

    distribution_results = query.group_by(models.PointType.description).all()
    
    distribution = [{"name": r.description, "value": r.total_value or 0} for r in distribution_results]

    return {
        "activity_distribution": distribution
    }
