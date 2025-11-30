"""
Script to populate the database with sample data at project launch.
This script can be executed manually or automatically at application startup.
"""
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.workout import Workout, Exercise, Set
from app.core.security import get_password_hash
from datetime import datetime, timedelta

def seed_database():
    """Populate the database with sample data."""
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(User).first():
            print("Database already contains data. Seed skipped.")
            return
        
        # Create sample users
        user1 = User(
            email="john.doe@example.com",
            hashed_password=get_password_hash("password123")
        )
        user2 = User(
            email="jane.smith@example.com",
            hashed_password=get_password_hash("password123")
        )
        db.add(user1)
        db.add(user2)
        db.commit()
        db.refresh(user1)
        db.refresh(user2)
        
        print(f"✓ Users created: {user1.email}, {user2.email}")
        
        # Create workouts for user1
        workout1 = Workout(
            name="Leg Day",
            is_public=True,
            user_id=user1.id,
            date=datetime.now() - timedelta(days=2)
        )
        db.add(workout1)
        db.commit()
        db.refresh(workout1)
        
        # Exercises for workout1
        exercise1_1 = Exercise(name="Squat", workout_id=workout1.id)
        db.add(exercise1_1)
        db.commit()
        db.refresh(exercise1_1)
        
        db.add(Set(exercise_id=exercise1_1.id, weight=100.0, reps=5))
        db.add(Set(exercise_id=exercise1_1.id, weight=100.0, reps=5))
        db.add(Set(exercise_id=exercise1_1.id, weight=100.0, reps=5))
        
        exercise1_2 = Exercise(name="Leg Press", workout_id=workout1.id)
        db.add(exercise1_2)
        db.commit()
        db.refresh(exercise1_2)
        
        db.add(Set(exercise_id=exercise1_2.id, weight=200.0, reps=10))
        db.add(Set(exercise_id=exercise1_2.id, weight=200.0, reps=10))
        
        workout2 = Workout(
            name="Upper Body",
            is_public=False,
            user_id=user1.id,
            date=datetime.now() - timedelta(days=1)
        )
        db.add(workout2)
        db.commit()
        db.refresh(workout2)
        
        exercise2_1 = Exercise(name="Bench Press", workout_id=workout2.id)
        db.add(exercise2_1)
        db.commit()
        db.refresh(exercise2_1)
        
        db.add(Set(exercise_id=exercise2_1.id, weight=80.0, reps=8))
        db.add(Set(exercise_id=exercise2_1.id, weight=80.0, reps=8))
        db.add(Set(exercise_id=exercise2_1.id, weight=80.0, reps=6))
        
        # Create workouts for user2
        workout3 = Workout(
            name="Cardio & Core",
            is_public=True,
            user_id=user2.id,
            date=datetime.now() - timedelta(days=3)
        )
        db.add(workout3)
        db.commit()
        db.refresh(workout3)
        
        exercise3_1 = Exercise(name="Plank", workout_id=workout3.id)
        db.add(exercise3_1)
        db.commit()
        db.refresh(exercise3_1)
        
        db.add(Set(exercise_id=exercise3_1.id, weight=0.0, reps=60))  # 60 seconds
        db.add(Set(exercise_id=exercise3_1.id, weight=0.0, reps=60))
        db.add(Set(exercise_id=exercise3_1.id, weight=0.0, reps=45))
        
        exercise3_2 = Exercise(name="Burpees", workout_id=workout3.id)
        db.add(exercise3_2)
        db.commit()
        db.refresh(exercise3_2)
        
        db.add(Set(exercise_id=exercise3_2.id, weight=0.0, reps=15))
        db.add(Set(exercise_id=exercise3_2.id, weight=0.0, reps=15))
        db.add(Set(exercise_id=exercise3_2.id, weight=0.0, reps=12))
        
        db.commit()
        
        print("✓ Workouts created successfully")
        print(f"  - {workout1.name} (public)")
        print(f"  - {workout2.name} (private)")
        print(f"  - {workout3.name} (public)")
        print("\n✅ Database initialized successfully!")
        print("\nYou can login with:")
        print("  Email: john.doe@example.com, Password: password123")
        print("  Email: jane.smith@example.com, Password: password123")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error during seed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

