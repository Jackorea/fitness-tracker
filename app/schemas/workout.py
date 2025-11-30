from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SetBase(BaseModel):
    weight: float
    reps: int

class SetCreate(SetBase):
    pass

class SetOut(SetBase):
    id: int
    class Config:
        orm_mode = True

class ExerciseBase(BaseModel):
    name: str

class ExerciseCreate(ExerciseBase):
    sets: List[SetCreate]

class ExerciseOut(ExerciseBase):
    id: int
    sets: List[SetOut]
    class Config:
        orm_mode = True

class WorkoutBase(BaseModel):
    name: str
    is_public: bool = False

class WorkoutCreate(WorkoutBase):
    exercises: List[ExerciseCreate]

class WorkoutOut(WorkoutBase):
    id: int
    date: datetime
    user_id: int
    exercises: List[ExerciseOut]
    class Config:
        orm_mode = True

