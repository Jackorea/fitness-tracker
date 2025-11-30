from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.workout import WorkoutCreate, WorkoutOut
from app.routers.auth import get_current_user
from app.services import workout as workout_service

router = APIRouter(
    prefix="/workouts",
    tags=["Workouts"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=WorkoutOut)
def create_workout(workout: WorkoutCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return workout_service.create_workout(db=db, workout=workout, user_id=current_user.id)

@router.get("/", response_model=List[WorkoutOut])
def read_workouts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return workout_service.get_user_workouts(db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/public", response_model=List[WorkoutOut])
def read_public_workouts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return workout_service.get_public_workouts(db, skip=skip, limit=limit)

@router.get("/{workout_id}", response_model=WorkoutOut)
def read_workout(workout_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_workout = workout_service.get_workout(db, workout_id=workout_id)
    if db_workout is None:
        raise HTTPException(status_code=404, detail="Workout not found")
    if db_workout.user_id != current_user.id and not db_workout.is_public:
        raise HTTPException(status_code=403, detail="Not authorized to view this workout")
    return db_workout

