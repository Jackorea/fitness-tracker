# 🏋️ Fitness Tracker

Fitness Tracker is a fullstack web application that allows users to manage their workout records, track their progress, and share their workout routines.

## 📋 Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Challenges Encountered](#challenges-encountered)
- [Future Improvements](#future-improvements)

## ✨ Key Features

### Basic Features

- **User Authentication**: JWT-based secure authentication system
- **Workout Management**: Create, view, and track workout sessions
- **Exercise Details**: Track sets per exercise (weight, repetitions)
- **Privacy & Sharing**: Optional sharing with public/private settings
- **Public Feed**: Explore public workout routines from other users

### Advanced Features

#### 📊 Statistics & Progress Tracking
- 4 statistical cards (Total workouts, Total exercises, Total volume, Workout streak)
- Workout frequency bar chart (last 30 days)
- Volume progress line chart
- Top 10 most frequent exercises horizontal bar chart
- Interactive charts implemented in pure CSS/JS

#### 📅 Calendar View
- Monthly calendar format for workout history visualization
- Color-coded workout dates with workout count badges
- Click on dates to view all workouts for that day
- Previous/next month navigation

#### 🏆 Personal Records Tracking
- Automatic tracking of best records per exercise
  - Max Weight
  - Max Reps
  - Max Volume
- Last PR achievement date display

#### 📋 Workout Templates
- Save frequently used workouts as templates
- Quick start workouts from templates
- Template management (create, view, delete, use)
- Stored in localStorage for browser persistence

#### ⏱️ Rest Timer
- Rest timer between sets (90 seconds default)
- Pause/resume/reset functionality
- Floating UI (top right corner)
- Beep sound notification using Web Audio API

#### 🔍 Search & Filtering
- Real-time workout search
- Filter by title or exercise name
- Instant results display

#### ⚖️ Volume Tracking
- Set volume calculation (weight × reps)
- Exercise volume sum
- Total workout volume
- Total volume summary in stats tab

## 🛠️ Tech Stack

### Backend
- **Language**: Python 3.10+
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt
- **Containerization**: Docker & Docker Compose

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern and responsive design, pure CSS charts
- **JavaScript (Vanilla)**: Pure JavaScript without frameworks (~2,500 lines)
- **Architecture**: SPA (Single Page Application)
- **Modules**: 
  - `auth.js`: Authentication management
  - `api.js`: Backend communication
  - `app.js`: Main application logic
  - `stats.js`: Statistics and charts
  - `calendar.js`: Calendar view
  - `templates.js`: Template management

## 🚀 Quick Start

### Get Started in 3 Steps

```bash
# 1. Navigate to project directory
cd fitness_tracker

# 2. Run application with Docker Compose (includes test data)
SEED_DB=true docker-compose up --build

# 3. Access in browser
# Frontend: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

### Test Accounts

If test data is included, you can use the following accounts:
- **Email**: `john.doe@example.com` / **Password**: `password123`
- **Email**: `jane.smith@example.com` / **Password**: `password123`

## 📦 Installation & Setup

### Prerequisites

- Docker and Docker Compose must be installed on your machine.
  - [Install Docker Desktop](https://www.docker.com/products/docker-desktop)

### Running the Application

1. Clone the repository.
2. Navigate to the `fitness_tracker` directory.
3. Run containers with Docker Compose:

```bash
docker-compose up --build
```

### Database Initial Data Setup

To automatically generate sample data when first running the project:

**Method 1 - Using Environment Variable**:
```bash
SEED_DB=true docker-compose up --build
```

**Method 2 - Manual Execution**:
```bash
python scripts/seed_db.py
```

The initial data includes the following test users:
- `john.doe@example.com` / Password: `password123`
- `jane.smith@example.com` / Password: `password123`

Each user will have example workouts (both public and private) created.

### Application Access

Once the application is running, you can access it at:
- **Frontend Web**: `http://localhost:8000`
- **API Documentation (Swagger UI)**: `http://localhost:8000/docs`
- **Alternative Documentation (ReDoc)**: `http://localhost:8000/redoc`
- **PostgreSQL**: `localhost:5432`

### Stopping the Application

```bash
# Stop containers
docker-compose down

# Stop containers and remove data
docker-compose down -v
```

## 💻 Usage

### Web Interface

#### 1. Authentication
- **Sign Up**: Create a new account (email and password)
- **Login**: Login with existing account
- **Logout**: Logout from the top navigation bar

#### 2. 📝 My Workouts
- Display all personal workout records in grid format
- Public/private badge display
- Total volume display for each workout
- Search functionality: Filter by title or exercise name
- Click workout card to view detailed information in modal

#### 3. 📊 Statistics (Stats)
- Statistics cards: Total workouts, Total exercises, Total volume, Workout streak
- Workout frequency chart: Workout frequency for the last 30 days
- Volume progress chart: Volume increase trend over time
- Most frequent exercises chart: Top 10 exercises

#### 4. 📅 Calendar
- Monthly calendar format for workout history visualization
- Color-coded workout dates with workout count badges
- Click on dates to view all workouts for that day
- Previous/next month navigation

#### 5. 🏆 Personal Records
- Automatic tracking of best records per exercise
- Display max weight, max reps, max volume
- Last PR achievement date display

#### 6. 📋 Templates
- Save frequently used workouts as templates
- Quick start workouts from templates
- Template management (create, view, delete, use)
- Stored in localStorage

#### 7. ➕ Create Workout
- Workout title, date, public/private settings
- Add unlimited exercises
- Add unlimited sets per exercise
- Rest timer functionality (90 second countdown)
- Save as template option
- Real-time form validation

#### 8. 🌐 Public Feed
- Explore public workout routines from other users
- View workout details
- Social feature for inspiration

### API Usage

#### 1. User Authentication

**Sign Up**:
```bash
POST http://localhost:8000/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Login**:
```bash
POST http://localhost:8000/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=your_password
```

Response includes JWT token:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### 2. Workout Management

All workout-related APIs require authentication. Include token in request header:
```
Authorization: Bearer <your_access_token>
```

**Create Workout**:
```bash
POST http://localhost:8000/workouts/
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "name": "Leg Day",
  "is_public": true,
  "exercises": [
    {
      "name": "Squat",
      "sets": [
        {"weight": 100.0, "reps": 5},
        {"weight": 100.0, "reps": 5}
      ]
    }
  ]
}
```

**Get My Workouts**:
```bash
GET http://localhost:8000/workouts/
Authorization: Bearer <your_token>
```

**Get Public Workouts**:
```bash
GET http://localhost:8000/workouts/public
Authorization: Bearer <your_token>
```

**Get Specific Workout**:
```bash
GET http://localhost:8000/workouts/{workout_id}
Authorization: Bearer <your_token>
```

#### 3. Using Swagger UI (Recommended)

1. Open `http://localhost:8000/docs` in your browser
2. Click the "Authorize" button
3. Enter the token received after login (format: `Bearer <token>` or just `<token>`)
4. You can directly test each API endpoint

## 📁 Project Structure

```
fitness_tracker/
├── app/
│   ├── models/              # Database models (SQLAlchemy)
│   │   ├── user.py         # User model
│   │   └── workout.py      # Workout, Exercise, Set models
│   ├── schemas/            # Data validation schemas (Pydantic)
│   │   ├── user.py         # User schema
│   │   └── workout.py      # Workout schema
│   ├── routers/            # API endpoints
│   │   ├── auth.py         # Authentication router (signup, login)
│   │   └── workouts.py     # Workout router
│   ├── services/           # Business logic
│   │   └── workout.py      # Workout service
│   ├── core/               # Core configuration
│   │   └── security.py     # Security (password hashing, JWT)
│   ├── static/             # Frontend files
│   │   ├── index.html      # Main SPA (280+ lines)
│   │   ├── css/
│   │   │   └── styles.css  # Styles (1,200+ lines)
│   │   └── js/
│   │       ├── auth.js    # Authentication management (45 lines)
│   │       ├── api.js     # API client (96 lines)
│   │       ├── app.js     # Main logic (700+ lines)
│   │       ├── stats.js   # Statistics and charts (280 lines)
│   │       ├── calendar.js # Calendar view (130 lines)
│   │       └── templates.js # Template management (230 lines)
│   ├── database.py         # Database connection settings
│   └── main.py            # FastAPI application entry point
├── scripts/
│   └── seed_db.py         # Database initial data generation script
├── tests/                 # Test files
│   ├── conftest.py        # Test configuration
│   ├── test_auth.py       # Authentication tests
│   └── test_workouts.py   # Workout tests
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile             # Docker image configuration
└── requirements.txt       # Python dependencies
```

## 🧪 Testing

To run automated tests:

```bash
# Install dependencies
pip install -r requirements.txt

# Run tests
pytest
```

Or using Docker:

```bash
docker-compose run web pytest
```

Tests include:
- User authentication tests (signup, login)
- Workout management tests (create, read, public/private)

## 📊 Data Model Structure

### User
- `id`: Unique identifier
- `email`: Email address (unique)
- `hashed_password`: Encrypted password

### Workout
- `id`: Unique identifier
- `user_id`: Author ID (foreign key)
- `name`: Workout session name
- `date`: Creation date/time
- `is_public`: Public visibility (default: false)

### Exercise
- `id`: Unique identifier
- `workout_id`: Parent workout ID (foreign key)
- `name`: Exercise name

### Set
- `id`: Unique identifier
- `exercise_id`: Parent exercise ID (foreign key)
- `weight`: Weight (kg)
- `reps`: Repetitions

## 🐛 Error Handling

The API returns the following HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request (e.g., already registered email)
- `401 Unauthorized`: Authentication failed (invalid token or credentials)
- `403 Forbidden`: No permission (attempting to access another user's private workout)
- `404 Not Found`: Resource not found

## 💡 Challenges Encountered

1. **Database Modeling**: Hierarchical structure of Workout → Exercise → Set and SQLAlchemy relationships, cascade handling on deletion
2. **Transaction Management**: Consistent transaction handling when creating workouts with multiple exercises and sets
3. **Test Environment Setup**: Avoiding conflicts with the application when setting up test environment with in-memory SQLite
4. **JWT Authentication**: JWT token generation, validation, and token handling in protected routes
5. **Permission Management**: Implementing logic so users can only view their own private workouts while allowing access to public workouts
6. **Pure CSS Chart Implementation**: Implementing charts using only CSS without external libraries
7. **SPA State Management**: Complex state management with pure JavaScript without frameworks

## 🔮 Future Improvements

### Backend Improvements
1. **Database Migrations**: Professional migration management using Alembic
2. **Advanced Validation**: Add business logic validation (weight range, repetition limits, etc.)
3. **Update & Delete APIs**: Add PUT/PATCH and DELETE endpoints
4. **Performance Optimization**: Apply eager loading to prevent N+1 problems
5. **Security Enhancement**: Rate limiting, token expiration validation, refresh token system

### Frontend Improvements
1. **Dark Mode**: Theme switching functionality
2. **More Charts**: Add pie charts, donut charts, etc.
3. **Goal Setting**: Goal setting and tracking functionality
4. **Data Export**: Export data in CSV/JSON format
5. **PWA Conversion**: Convert to Progressive Web App for offline support
6. **Image Upload**: Workout photo upload functionality

### Feature Additions
1. **Workout Notes/Memos**: Add memos to each workout
2. **Friend Feature**: User follow system
3. **Like/Comments**: Social features for public workouts
4. **Workout Timer**: Track workout duration
5. **Notifications**: Workout schedule notifications

## 📚 Reference

### Why This Project Was Chosen

Reasons for choosing Fitness Tracker:
1. **Structured Data Management**: Practice complex data modeling with hierarchical structure of Workout → Exercise → Set
2. **Security & Privacy**: Implement user data protection and optional sharing features
3. **Social Features**: Enable user interaction through sharing public workout routines
4. **Data Visualization**: Track progress through graphs and statistics
5. **Complex UX**: Various interactive features like timers, calendars, templates

## 📝 License

This project was developed for educational purposes.

## 👤 Author

Project developed as part of the "Application Fullstack Data" course.

---

**Happy Training! 💪🏋️‍♂️**
# fitness-tracker
