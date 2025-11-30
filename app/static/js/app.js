// Main application logic

// Global state
let exerciseCounter = 0;
let allWorkouts = [];
let restTimerInterval = null;
let restTimerSeconds = 0;
let restTimerRunning = false;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Check authentication state
    if (authManager.isAuthenticated()) {
        showApp();
        loadUserData();
    } else {
        showAuth();
    }

    // Setup event listeners
    setupAuthListeners();
    setupAppListeners();
    setupRestTimer();
    setupTemplateModal();
    setupCalendarControls();
}

// ===== AUTH SECTION =====

function setupAuthListeners() {
    // Toggle between login and signup
    document.getElementById('show-signup').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
        clearErrors();
    });

    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
        clearErrors();
    });

    // Login form
    document.getElementById('login-form-element').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            showLoading();
            const data = await apiClient.login(email, password);
            authManager.saveToken(data.access_token, email);
            showApp();
            loadUserData();
        } catch (error) {
            showError('login-error', error.message);
        } finally {
            hideLoading();
        }
    });

    // Signup form
    document.getElementById('signup-form-element').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-password-confirm').value;
        
        if (password !== confirmPassword) {
            showError('signup-error', 'Passwords do not match');
            return;
        }

        try {
            showLoading();
            await apiClient.signup(email, password);
            // Auto login after signup
            const data = await apiClient.login(email, password);
            authManager.saveToken(data.access_token, email);
            showApp();
            loadUserData();
        } catch (error) {
            showError('signup-error', error.message);
        } finally {
            hideLoading();
        }
    });
}

// ===== APP SECTION =====

function setupAppListeners() {
    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        authManager.clearAuth();
        showAuth();
        clearAppData();
    });

    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
            
            // Load data for specific tabs
            if (tabName === 'my-workouts') {
                loadMyWorkouts();
            } else if (tabName === 'public-feed') {
                loadPublicWorkouts();
            } else if (tabName === 'statistics') {
                renderStatistics(allWorkouts);
            } else if (tabName === 'calendar') {
                calendarManager.setWorkouts(allWorkouts);
                calendarManager.renderCalendar();
            } else if (tabName === 'personal-records') {
                renderPersonalRecords(allWorkouts);
            } else if (tabName === 'templates') {
                renderTemplates();
            }
        });
    });

    // Create workout form
    document.getElementById('create-workout-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleCreateWorkout();
    });

    // Add exercise button
    document.getElementById('add-exercise-btn').addEventListener('click', () => {
        addExerciseForm();
    });

    // Search functionality
    document.getElementById('workout-search').addEventListener('input', (e) => {
        filterWorkouts(e.target.value);
    });

    // Modal close
    const modal = document.getElementById('workout-modal');
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('workout-date').value = today;
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
}

async function loadUserData() {
    const email = authManager.getEmail();
    document.getElementById('user-email').textContent = email;
    
    // Load initial data
    await loadMyWorkouts();
}

// ===== WORKOUT FUNCTIONS =====

async function loadMyWorkouts() {
    try {
        showLoading();
        allWorkouts = await apiClient.getMyWorkouts();
        displayWorkouts(allWorkouts, 'my-workouts-list', true);
    } catch (error) {
        console.error('Error loading workouts:', error);
        document.getElementById('my-workouts-list').innerHTML = 
            `<p class="error-message">Failed to load workouts: ${error.message}</p>`;
    } finally {
        hideLoading();
    }
}

async function loadPublicWorkouts() {
    try {
        showLoading();
        const workouts = await apiClient.getPublicWorkouts();
        displayWorkouts(workouts, 'public-workouts-list', false);
    } catch (error) {
        console.error('Error loading public workouts:', error);
        document.getElementById('public-workouts-list').innerHTML = 
            `<p class="error-message">Failed to load public workouts: ${error.message}</p>`;
    } finally {
        hideLoading();
    }
}

function displayWorkouts(workouts, containerId, showPrivacy) {
    const container = document.getElementById(containerId);
    
    if (workouts.length === 0) {
        container.innerHTML = '<p class="empty-message">No workouts found</p>';
        return;
    }

    container.innerHTML = workouts.map(workout => {
        const date = new Date(workout.date).toLocaleDateString();
        const privacyBadge = showPrivacy ? 
            `<span class="badge ${workout.is_public ? 'badge-public' : 'badge-private'}">
                ${workout.is_public ? '🌐 Public' : '🔒 Private'}
            </span>` : '';
        
        // Calculate volume
        const volume = workout.exercises.reduce((total, ex) => {
            return total + ex.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
        }, 0);
        
        return `
            <div class="workout-card" data-workout-id="${workout.id}">
                <div class="workout-header">
                    <h3>${workout.title}</h3>
                    ${privacyBadge}
                </div>
                <p class="workout-date">📅 ${date}</p>
                <p class="workout-info">💪 ${workout.exercises.length} exercise${workout.exercises.length !== 1 ? 's' : ''}</p>
                <p class="workout-info">⚖️ ${volume.toFixed(0)} kg total volume</p>
                <button class="btn btn-secondary btn-sm view-workout-btn" data-workout-id="${workout.id}">
                    View Details
                </button>
            </div>
        `;
    }).join('');

    // Add event listeners to view buttons
    container.querySelectorAll('.view-workout-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const workoutId = btn.dataset.workoutId;
            await showWorkoutDetail(workoutId);
        });
    });
}

// Search/Filter workouts
function filterWorkouts(searchTerm) {
    const term = searchTerm.toLowerCase();
    const filtered = allWorkouts.filter(workout => {
        const titleMatch = workout.title.toLowerCase().includes(term);
        const exerciseMatch = workout.exercises.some(ex => 
            ex.name.toLowerCase().includes(term)
        );
        return titleMatch || exerciseMatch;
    });
    displayWorkouts(filtered, 'my-workouts-list', true);
}

async function showWorkoutDetail(workoutId) {
    try {
        showLoading();
        const workout = await apiClient.getWorkout(workoutId);
        
        const modal = document.getElementById('workout-modal');
        const detailContainer = document.getElementById('workout-detail');
        
        const date = new Date(workout.date).toLocaleDateString();
        
        // Calculate total volume
        const totalVolume = workout.exercises.reduce((total, ex) => {
            return total + ex.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
        }, 0);
        
        detailContainer.innerHTML = `
            <h2>${workout.title}</h2>
            <div class="workout-meta">
                <p>📅 ${date}</p>
                <span class="badge ${workout.is_public ? 'badge-public' : 'badge-private'}">
                    ${workout.is_public ? '🌐 Public' : '🔒 Private'}
                </span>
                <p>⚖️ Total Volume: ${totalVolume.toFixed(0)} kg</p>
            </div>
            
            <div class="exercises-detail">
                ${workout.exercises.map((exercise, idx) => {
                    const exerciseVolume = exercise.sets.reduce((sum, set) => 
                        sum + (set.weight * set.reps), 0
                    );
                    return `
                        <div class="exercise-detail">
                            <h3>${idx + 1}. ${exercise.name} <span class="exercise-volume">(${exerciseVolume.toFixed(0)} kg)</span></h3>
                            <table class="sets-table">
                                <thead>
                                    <tr>
                                        <th>Set</th>
                                        <th>Weight (kg)</th>
                                        <th>Reps</th>
                                        <th>Volume</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${exercise.sets.map((set, setIdx) => `
                                        <tr>
                                            <td>${setIdx + 1}</td>
                                            <td>${set.weight}</td>
                                            <td>${set.reps}</td>
                                            <td>${(set.weight * set.reps).toFixed(0)} kg</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        modal.style.display = 'flex';
    } catch (error) {
        console.error('Error loading workout detail:', error);
        alert('Failed to load workout details: ' + error.message);
    } finally {
        hideLoading();
    }
}

// ===== CREATE WORKOUT FUNCTIONS =====

function addExerciseForm() {
    exerciseCounter++;
    const container = document.getElementById('exercises-container');
    
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-form';
    exerciseDiv.dataset.exerciseId = exerciseCounter;
    exerciseDiv.innerHTML = `
        <div class="exercise-header">
            <h4>Exercise ${exerciseCounter}</h4>
            <button type="button" class="btn-remove" onclick="removeExercise(${exerciseCounter})">✕</button>
        </div>
        <div class="form-group">
            <label>Exercise Name</label>
            <input type="text" class="exercise-name" required placeholder="e.g., Bench Press">
        </div>
        <div class="sets-container" data-exercise-id="${exerciseCounter}">
            <!-- Sets will be added here -->
        </div>
        <div class="exercise-actions">
            <button type="button" class="btn btn-secondary btn-sm" onclick="addSet(${exerciseCounter})">+ Add Set</button>
            <button type="button" class="btn btn-success btn-sm" onclick="startRestTimer()">⏱️ Start Rest Timer</button>
        </div>
    `;
    
    container.appendChild(exerciseDiv);
    
    // Add first set automatically
    addSet(exerciseCounter);
}

function removeExercise(exerciseId) {
    const exerciseDiv = document.querySelector(`[data-exercise-id="${exerciseId}"].exercise-form`);
    if (exerciseDiv) {
        exerciseDiv.remove();
    }
}

function addSet(exerciseId) {
    const container = document.querySelector(`.sets-container[data-exercise-id="${exerciseId}"]`);
    const setCount = container.children.length + 1;
    
    const setDiv = document.createElement('div');
    setDiv.className = 'set-form';
    setDiv.innerHTML = `
        <span class="set-number">Set ${setCount}</span>
        <div class="set-inputs">
            <input type="number" class="set-weight" placeholder="Weight (kg)" step="0.5" min="0" required>
            <input type="number" class="set-reps" placeholder="Reps" min="1" required>
            <button type="button" class="btn-remove-small" onclick="removeSet(this)">✕</button>
        </div>
    `;
    
    container.appendChild(setDiv);
}

function removeSet(button) {
    const setDiv = button.closest('.set-form');
    const container = setDiv.parentElement;
    setDiv.remove();
    
    // Renumber remaining sets
    Array.from(container.children).forEach((set, idx) => {
        set.querySelector('.set-number').textContent = `Set ${idx + 1}`;
    });
}

async function handleCreateWorkout() {
    const title = document.getElementById('workout-title').value;
    const date = document.getElementById('workout-date').value;
    const isPublic = document.getElementById('workout-public').checked;
    const saveAsTemplate = document.getElementById('save-as-template').checked;
    
    // Collect exercises
    const exerciseForms = document.querySelectorAll('.exercise-form');
    
    if (exerciseForms.length === 0) {
        showError('create-error', 'Please add at least one exercise');
        return;
    }
    
    const exercises = [];
    
    for (const exerciseForm of exerciseForms) {
        const name = exerciseForm.querySelector('.exercise-name').value;
        const setForms = exerciseForm.querySelectorAll('.set-form');
        
        if (setForms.length === 0) {
            showError('create-error', 'Each exercise must have at least one set');
            return;
        }
        
        const sets = [];
        for (const setForm of setForms) {
            const weight = parseFloat(setForm.querySelector('.set-weight').value);
            const reps = parseInt(setForm.querySelector('.set-reps').value);
            sets.push({ weight, reps });
        }
        
        exercises.push({ name, sets });
    }
    
    const workoutData = {
        title,
        date,
        is_public: isPublic,
        exercises
    };
    
    try {
        showLoading();
        await apiClient.createWorkout(workoutData);
        
        // Save as template if checked
        if (saveAsTemplate) {
            templateManager.saveTemplate({
                name: title,
                description: '',
                exercises
            });
            alert('Workout created and saved as template!');
        } else {
            alert('Workout created successfully!');
        }
        
        // Reset form
        document.getElementById('create-workout-form').reset();
        document.getElementById('exercises-container').innerHTML = '';
        exerciseCounter = 0;
        clearErrors();
        
        // Switch to my workouts tab and reload
        switchTab('my-workouts');
        await loadMyWorkouts();
    } catch (error) {
        showError('create-error', 'Failed to create workout: ' + error.message);
    } finally {
        hideLoading();
    }
}

// ===== REST TIMER =====

function setupRestTimer() {
    document.getElementById('timer-pause').addEventListener('click', toggleRestTimer);
    document.getElementById('timer-reset').addEventListener('click', resetRestTimer);
    document.getElementById('timer-close').addEventListener('click', closeRestTimer);
}

function startRestTimer(seconds = 90) {
    restTimerSeconds = seconds;
    restTimerRunning = true;
    document.getElementById('rest-timer').style.display = 'block';
    updateTimerDisplay();
    
    if (restTimerInterval) clearInterval(restTimerInterval);
    
    restTimerInterval = setInterval(() => {
        if (restTimerRunning && restTimerSeconds > 0) {
            restTimerSeconds--;
            updateTimerDisplay();
            
            if (restTimerSeconds === 0) {
                // Timer finished
                playTimerSound();
                resetRestTimer();
            }
        }
    }, 1000);
}

function toggleRestTimer() {
    restTimerRunning = !restTimerRunning;
    document.getElementById('timer-pause').textContent = restTimerRunning ? 'Pause' : 'Resume';
}

function resetRestTimer() {
    restTimerRunning = false;
    restTimerSeconds = 90;
    updateTimerDisplay();
    document.getElementById('timer-pause').textContent = 'Pause';
}

function closeRestTimer() {
    if (restTimerInterval) clearInterval(restTimerInterval);
    restTimerRunning = false;
    restTimerSeconds = 0;
    document.getElementById('rest-timer').style.display = 'none';
}

function updateTimerDisplay() {
    const minutes = Math.floor(restTimerSeconds / 60);
    const seconds = restTimerSeconds % 60;
    document.getElementById('timer-display').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function playTimerSound() {
    // Simple beep using Web Audio API
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
        
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.5);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// ===== UI HELPER FUNCTIONS =====

function showAuth() {
    document.getElementById('auth-section').style.display = 'flex';
    document.getElementById('app-section').style.display = 'none';
    clearForms();
    clearErrors();
}

function showApp() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
}

function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
}

function clearForms() {
    document.querySelectorAll('form').forEach(form => form.reset());
}

function clearAppData() {
    document.getElementById('my-workouts-list').innerHTML = '';
    document.getElementById('public-workouts-list').innerHTML = '';
    document.getElementById('exercises-container').innerHTML = '';
    exerciseCounter = 0;
    allWorkouts = [];
}
