// Statistics and Progress Tracking

class StatsManager {
    constructor() {
        this.workouts = [];
    }

    setWorkouts(workouts) {
        this.workouts = workouts;
    }

    // Calculate total workouts
    getTotalWorkouts() {
        return this.workouts.length;
    }

    // Calculate total exercises across all workouts
    getTotalExercises() {
        return this.workouts.reduce((total, workout) => {
            return total + workout.exercises.length;
        }, 0);
    }

    // Calculate total volume (weight * reps) across all workouts
    getTotalVolume() {
        return this.workouts.reduce((total, workout) => {
            const workoutVolume = workout.exercises.reduce((exTotal, exercise) => {
                const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
                    return setTotal + (set.weight * set.reps);
                }, 0);
                return exTotal + exerciseVolume;
            }, 0);
            return total + workoutVolume;
        }, 0);
    }

    // Calculate workout streak (consecutive days with workouts)
    getWorkoutStreak() {
        if (this.workouts.length === 0) return 0;

        // Sort workouts by date (newest first)
        const sortedWorkouts = [...this.workouts].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        // Get unique dates
        const uniqueDates = [...new Set(sortedWorkouts.map(w => w.date.split('T')[0]))];
        
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < uniqueDates.length; i++) {
            const workoutDate = new Date(uniqueDates[i]);
            workoutDate.setHours(0, 0, 0, 0);
            
            const diffDays = Math.floor((today - workoutDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === i || (i === 0 && diffDays === 0)) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    // Get workout frequency for last N days
    getWorkoutFrequency(days = 30) {
        const frequency = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Initialize all days with 0
        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            frequency[dateStr] = 0;
        }

        // Count workouts per day
        this.workouts.forEach(workout => {
            const workoutDate = workout.date.split('T')[0];
            if (frequency.hasOwnProperty(workoutDate)) {
                frequency[workoutDate]++;
            }
        });

        return frequency;
    }

    // Get exercise frequency
    getExerciseFrequency() {
        const frequency = {};
        
        this.workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                const name = exercise.name;
                if (frequency[name]) {
                    frequency[name]++;
                } else {
                    frequency[name] = 1;
                }
            });
        });

        // Sort by frequency
        return Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Top 10
    }

    // Get volume progress over time
    getVolumeProgress() {
        const volumeByDate = {};
        
        this.workouts.forEach(workout => {
            const date = workout.date.split('T')[0];
            const volume = workout.exercises.reduce((total, exercise) => {
                return total + exercise.sets.reduce((setTotal, set) => {
                    return setTotal + (set.weight * set.reps);
                }, 0);
            }, 0);
            
            if (volumeByDate[date]) {
                volumeByDate[date] += volume;
            } else {
                volumeByDate[date] = volume;
            }
        });

        // Sort by date
        return Object.entries(volumeByDate)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]));
    }

    // Get personal records for each exercise
    getPersonalRecords() {
        const records = {};
        
        this.workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                const name = exercise.name;
                
                exercise.sets.forEach(set => {
                    if (!records[name]) {
                        records[name] = {
                            maxWeight: set.weight,
                            maxReps: set.reps,
                            maxVolume: set.weight * set.reps,
                            date: workout.date
                        };
                    } else {
                        if (set.weight > records[name].maxWeight) {
                            records[name].maxWeight = set.weight;
                            records[name].date = workout.date;
                        }
                        if (set.reps > records[name].maxReps) {
                            records[name].maxReps = set.reps;
                        }
                        const volume = set.weight * set.reps;
                        if (volume > records[name].maxVolume) {
                            records[name].maxVolume = volume;
                        }
                    }
                });
            });
        });

        return records;
    }
}

// Render statistics
function renderStatistics(workouts) {
    const stats = new StatsManager();
    stats.setWorkouts(workouts);

    // Update stat cards
    document.getElementById('stat-total-workouts').textContent = stats.getTotalWorkouts();
    document.getElementById('stat-total-exercises').textContent = stats.getTotalExercises();
    document.getElementById('stat-total-volume').textContent = 
        stats.getTotalVolume().toFixed(1) + ' kg';
    document.getElementById('stat-streak').textContent = stats.getWorkoutStreak();

    // Render charts
    renderFrequencyChart(stats.getWorkoutFrequency());
    renderVolumeChart(stats.getVolumeProgress());
    renderExerciseChart(stats.getExerciseFrequency());
}

// Render workout frequency chart (simple bar chart)
function renderFrequencyChart(frequency) {
    const container = document.getElementById('frequency-chart');
    const entries = Object.entries(frequency).reverse(); // Oldest to newest
    
    if (entries.length === 0) {
        container.innerHTML = '<p class="empty-message">No workout data yet</p>';
        return;
    }

    const maxCount = Math.max(...entries.map(([, count]) => count), 1);
    
    let html = '<div class="bar-chart">';
    entries.forEach(([date, count]) => {
        const percentage = (count / maxCount) * 100;
        const dateObj = new Date(date);
        const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
        
        html += `
            <div class="bar-item">
                <div class="bar-container">
                    <div class="bar" style="height: ${percentage}%">
                        ${count > 0 ? count : ''}
                    </div>
                </div>
                <div class="bar-label">${label}</div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// Render volume progress chart
function renderVolumeChart(volumeProgress) {
    const container = document.getElementById('volume-chart');
    
    if (volumeProgress.length === 0) {
        container.innerHTML = '<p class="empty-message">No volume data yet</p>';
        return;
    }

    const maxVolume = Math.max(...volumeProgress.map(([, vol]) => vol), 1);
    
    let html = '<div class="line-chart">';
    volumeProgress.forEach(([date, volume], index) => {
        const percentage = (volume / maxVolume) * 100;
        const dateObj = new Date(date);
        const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
        
        html += `
            <div class="line-item">
                <div class="line-point" style="bottom: ${percentage}%" 
                     title="${volume.toFixed(0)} kg on ${label}">
                    <span class="point-dot"></span>
                </div>
                <div class="line-label">${label}</div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// Render exercise frequency chart
function renderExerciseChart(exercises) {
    const container = document.getElementById('exercise-chart');
    
    if (exercises.length === 0) {
        container.innerHTML = '<p class="empty-message">No exercise data yet</p>';
        return;
    }

    const maxCount = Math.max(...exercises.map(([, count]) => count), 1);
    
    let html = '<div class="horizontal-bar-chart">';
    exercises.forEach(([name, count]) => {
        const percentage = (count / maxCount) * 100;
        
        html += `
            <div class="h-bar-item">
                <div class="h-bar-label">${name}</div>
                <div class="h-bar-container">
                    <div class="h-bar" style="width: ${percentage}%"></div>
                    <span class="h-bar-value">${count}</span>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// Render personal records
function renderPersonalRecords(workouts) {
    const stats = new StatsManager();
    stats.setWorkouts(workouts);
    const records = stats.getPersonalRecords();
    
    const container = document.getElementById('pr-list');
    
    if (Object.keys(records).length === 0) {
        container.innerHTML = '<p class="empty-message">No personal records yet. Start working out!</p>';
        return;
    }

    let html = '';
    Object.entries(records)
        .sort((a, b) => b[1].maxWeight - a[1].maxWeight) // Sort by max weight
        .forEach(([exercise, record]) => {
            const date = new Date(record.date).toLocaleDateString();
            
            html += `
                <div class="pr-card">
                    <h3 class="pr-exercise">${exercise}</h3>
                    <div class="pr-stats">
                        <div class="pr-stat">
                            <div class="pr-stat-label">Max Weight</div>
                            <div class="pr-stat-value">🏋️ ${record.maxWeight} kg</div>
                        </div>
                        <div class="pr-stat">
                            <div class="pr-stat-label">Max Reps</div>
                            <div class="pr-stat-value">💪 ${record.maxReps}</div>
                        </div>
                        <div class="pr-stat">
                            <div class="pr-stat-label">Max Volume</div>
                            <div class="pr-stat-value">⚖️ ${record.maxVolume.toFixed(0)} kg</div>
                        </div>
                    </div>
                    <div class="pr-date">Last PR: ${date}</div>
                </div>
            `;
        });
    
    container.innerHTML = html;
}

// Export for use in main app
const statsManager = new StatsManager();

