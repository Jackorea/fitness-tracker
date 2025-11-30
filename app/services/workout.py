from sqlalchemy.orm import Session
from app.models.workout import Workout, Exercise, Set
from app.schemas.workout import WorkoutCreate

def create_workout(db: Session, workout: WorkoutCreate, user_id: int):
    db_workout = Workout(name=workout.name, is_public=workout.is_public, user_id=user_id)
    db.add(db_workout)
    db.commit()
    db.refresh(db_workout)

    for exercise_data in workout.exercises:
        db_exercise = Exercise(workout_id=db_workout.id, name=exercise_data.name)
        db.add(db_exercise)
        db.commit()
        db.refresh(db_exercise)

        for set_data in exercise_data.sets:
            db_set = Set(exercise_id=db_exercise.id, weight=set_data.weight, reps=set_data.reps)
            db.add(db_set)

    db.commit()
    db.refresh(db_workout)
    return db_workout

def get_user_workouts(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Workout).filter(Workout.user_id == user_id).offset(skip).limit(limit).all()

def get_workout(db: Session, workout_id: int):
    return db.query(Workout).filter(Workout.id == workout_id).first()

def get_public_workouts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Workout).filter(Workout.is_public == True).offset(skip).limit(limit).all()

