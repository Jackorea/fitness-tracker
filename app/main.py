from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.database import engine, Base
from app.routers import auth, workouts
import os
from pathlib import Path

# Models need to be imported before creating tables
from app.models import user, workout

app = FastAPI(title="Fitness Tracker API")

# Mount static files
static_path = Path(__file__).parent / "static"
static_path.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

@app.on_event("startup")
def on_startup():
    # Create tables
    # In a real production app, you should use Alembic for migrations
    # We only create if not testing to avoid side effects or connection errors
    import sys
    if "pytest" not in sys.modules:
        try:
            Base.metadata.create_all(bind=engine)
            # Optionally seed the database if SEED_DB environment variable is set
            if os.getenv("SEED_DB", "false").lower() == "true":
                try:
                    import sys
                    import os
                    # Add parent directory to path for script imports
                    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                    if parent_dir not in sys.path:
                        sys.path.insert(0, parent_dir)
                    from scripts.seed_db import seed_database
                    seed_database()
                except Exception as seed_error:
                    print(f"Warning: Could not seed database: {seed_error}")
        except Exception as e:
            print(f"Error creating tables: {e}")

app.include_router(auth.router)
app.include_router(workouts.router)

@app.get("/")
def read_root():
    """Serve the frontend application"""
    index_path = static_path / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"message": "Welcome to Fitness Tracker API - Frontend coming soon"}
