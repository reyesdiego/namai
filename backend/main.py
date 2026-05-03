import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import database, models, auth
from routers import auth_router, agents_router, points_router, stats_router

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Namai Real Estate API", description="Puntos y Gestión de Agentes")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev, ideally specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_router.router)
app.include_router(agents_router.router)
app.include_router(points_router.router)
app.include_router(stats_router.router)

# Initial script to create the first admin
def create_initial_admin():
    db = database.SessionLocal()
    admin = db.query(models.User).filter(models.User.email == "admin@namai.com").first()
    if not admin:
        hashed_password = auth.get_password_hash("admin123")
        db_admin = models.User(
            email="admin@namai.com",
            name="Administrador Namai",
            hashed_password=hashed_password,
            role="admin",
            is_active=True
        )
        db.add(db_admin)
        db.commit()
    db.close()

create_initial_admin()

@app.get("/")
def read_root():
    return {"message": "Welcome to Namai API"}
