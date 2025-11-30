// Calendar View for Workout History

class CalendarManager {
    constructor() {
        this.currentDate = new Date();
        this.workouts = [];
    }

    setWorkouts(workouts) {
        this.workouts = workouts;
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month/year display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('current-month-year').textContent = 
            `${monthNames[month]} ${year}`;

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Get workout dates for this month
        const workoutDates = this.getWorkoutDatesForMonth(year, month);
        
        // Build calendar grid
        let html = '<div class="calendar-weekdays">';
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdays.forEach(day => {
            html += `<div class="calendar-weekday">${day}</div>`;
        });
        html += '</div><div class="calendar-days">';
        
        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // Days of the month
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDay = new Date(year, month, day);
            currentDay.setHours(0, 0, 0, 0);
            
            const dateStr = currentDay.toISOString().split('T')[0];
            const isToday = currentDay.getTime() === today.getTime();
            const hasWorkout = workoutDates.includes(dateStr);
            const workoutCount = this.getWorkoutCountForDate(dateStr);
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (hasWorkout) classes += ' has-workout';
            
            html += `
                <div class="${classes}" data-date="${dateStr}">
                    <span class="day-number">${day}</span>
                    ${hasWorkout ? `<span class="workout-indicator">${workoutCount}</span>` : ''}
                </div>
            `;
        }
        
        html += '</div>';
        
        document.getElementById('calendar-grid').innerHTML = html;
        
        // Add click handlers for days with workouts
        document.querySelectorAll('.calendar-day.has-workout').forEach(dayEl => {
            dayEl.addEventListener('click', () => {
                const date = dayEl.dataset.date;
                this.showWorkoutsForDate(date);
            });
        });
    }

    getWorkoutDatesForMonth(year, month) {
        const dates = [];
        this.workouts.forEach(workout => {
            const workoutDate = new Date(workout.date);
            if (workoutDate.getFullYear() === year && workoutDate.getMonth() === month) {
                dates.push(workout.date.split('T')[0]);
            }
        });
        return [...new Set(dates)]; // Remove duplicates
    }

    getWorkoutCountForDate(dateStr) {
        return this.workouts.filter(w => w.date.split('T')[0] === dateStr).length;
    }

    showWorkoutsForDate(dateStr) {
        const workoutsForDate = this.workouts.filter(w => w.date.split('T')[0] === dateStr);
        
        if (workoutsForDate.length === 0) return;
        
        const dateObj = new Date(dateStr);
        const dateFormatted = dateObj.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        let html = `
            <h2>Workouts on ${dateFormatted}</h2>
            <div class="workouts-list">
        `;
        
        workoutsForDate.forEach(workout => {
            html += `
                <div class="workout-card" data-workout-id="${workout.id}">
                    <div class="workout-header">
                        <h3>${workout.title}</h3>
                        <span class="badge ${workout.is_public ? 'badge-public' : 'badge-private'}">
                            ${workout.is_public ? '🌐 Public' : '🔒 Private'}
                        </span>
                    </div>
                    <p class="workout-info">💪 ${workout.exercises.length} exercise${workout.exercises.length !== 1 ? 's' : ''}</p>
                    <button class="btn btn-secondary btn-sm view-workout-btn" data-workout-id="${workout.id}">
                        View Details
                    </button>
                </div>
            `;
        });
        
        html += '</div>';
        
        const modal = document.getElementById('workout-modal');
        const detailContainer = document.getElementById('workout-detail');
        detailContainer.innerHTML = html;
        
        // Add event listeners
        detailContainer.querySelectorAll('.view-workout-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const workoutId = btn.dataset.workoutId;
                await showWorkoutDetail(workoutId);
            });
        });
        
        modal.style.display = 'flex';
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }
}

// Create global calendar instance
const calendarManager = new CalendarManager();

// Setup calendar controls
function setupCalendarControls() {
    document.getElementById('prev-month').addEventListener('click', () => {
        calendarManager.prevMonth();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        calendarManager.nextMonth();
    });
}

