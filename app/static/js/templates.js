// Workout Templates Management

class TemplateManager {
    constructor() {
        this.storageKey = 'fitness_tracker_templates';
    }

    // Get all templates from localStorage
    getTemplates() {
        const templates = localStorage.getItem(this.storageKey);
        return templates ? JSON.parse(templates) : [];
    }

    // Save template
    saveTemplate(template) {
        const templates = this.getTemplates();
        template.id = Date.now().toString();
        template.createdAt = new Date().toISOString();
        templates.push(template);
        localStorage.setItem(this.storageKey, JSON.stringify(templates));
        return template;
    }

    // Delete template
    deleteTemplate(templateId) {
        const templates = this.getTemplates();
        const filtered = templates.filter(t => t.id !== templateId);
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    }

    // Get template by ID
    getTemplate(templateId) {
        const templates = this.getTemplates();
        return templates.find(t => t.id === templateId);
    }
}

const templateManager = new TemplateManager();

// Render templates list
function renderTemplates() {
    const templates = templateManager.getTemplates();
    const container = document.getElementById('templates-list');

    if (templates.length === 0) {
        container.innerHTML = '<p class="empty-message">No templates saved yet. Create your first template!</p>';
        return;
    }

    container.innerHTML = templates.map(template => {
        const exerciseCount = template.exercises.length;
        const createdDate = new Date(template.createdAt).toLocaleDateString();

        return `
            <div class="template-card">
                <div class="template-header">
                    <h3>${template.name}</h3>
                </div>
                ${template.description ? `<p class="template-description">${template.description}</p>` : ''}
                <p class="template-info">💪 ${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}</p>
                <p class="template-date">Created: ${createdDate}</p>
                <div class="template-actions-btn">
                    <button class="btn btn-primary btn-sm use-template-btn" data-template-id="${template.id}">
                        Use Template
                    </button>
                    <button class="btn btn-secondary btn-sm view-template-btn" data-template-id="${template.id}">
                        View
                    </button>
                    <button class="btn btn-danger btn-sm delete-template-btn" data-template-id="${template.id}">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Add event listeners
    container.querySelectorAll('.use-template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            useTemplate(btn.dataset.templateId);
        });
    });

    container.querySelectorAll('.view-template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            viewTemplate(btn.dataset.templateId);
        });
    });

    container.querySelectorAll('.delete-template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this template?')) {
                templateManager.deleteTemplate(btn.dataset.templateId);
                renderTemplates();
            }
        });
    });
}

// Use template to fill create workout form
function useTemplate(templateId) {
    const template = templateManager.getTemplate(templateId);
    if (!template) return;

    // Switch to create workout tab
    switchTab('create-workout');

    // Fill in form
    document.getElementById('workout-title').value = template.name;
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('workout-date').value = today;

    // Clear existing exercises
    document.getElementById('exercises-container').innerHTML = '';
    exerciseCounter = 0;

    // Add exercises from template
    template.exercises.forEach(exercise => {
        addExerciseForm();
        const exerciseForm = document.querySelector(`[data-exercise-id="${exerciseCounter}"].exercise-form`);
        exerciseForm.querySelector('.exercise-name').value = exercise.name;

        // Add sets
        const setsContainer = exerciseForm.querySelector('.sets-container');
        setsContainer.innerHTML = ''; // Clear default set
        
        exercise.sets.forEach(set => {
            addSet(exerciseCounter);
            const lastSet = setsContainer.lastElementChild;
            lastSet.querySelector('.set-weight').value = set.weight;
            lastSet.querySelector('.set-reps').value = set.reps;
        });
    });

    alert('Template loaded! You can now edit and save the workout.');
}

// View template details
function viewTemplate(templateId) {
    const template = templateManager.getTemplate(templateId);
    if (!template) return;

    let html = `
        <h2>${template.name}</h2>
        ${template.description ? `<p class="template-description-detail">${template.description}</p>` : ''}
        
        <div class="exercises-detail">
            ${template.exercises.map((exercise, idx) => `
                <div class="exercise-detail">
                    <h3>${idx + 1}. ${exercise.name}</h3>
                    <table class="sets-table">
                        <thead>
                            <tr>
                                <th>Set</th>
                                <th>Weight (kg)</th>
                                <th>Reps</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${exercise.sets.map((set, setIdx) => `
                                <tr>
                                    <td>${setIdx + 1}</td>
                                    <td>${set.weight}</td>
                                    <td>${set.reps}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `).join('')}
        </div>
    `;

    const modal = document.getElementById('workout-modal');
    const detailContainer = document.getElementById('workout-detail');
    detailContainer.innerHTML = html;
    modal.style.display = 'flex';
}

// Setup template modal
function setupTemplateModal() {
    const modal = document.getElementById('template-modal');
    const createBtn = document.getElementById('create-template-btn');
    const closeBtn = document.getElementById('template-modal-close');
    const cancelBtn = document.getElementById('cancel-template');
    const form = document.getElementById('template-form');

    // Open modal
    createBtn.addEventListener('click', () => {
        resetTemplateForm();
        modal.style.display = 'flex';
    });

    // Close modal
    const closeModal = () => {
        modal.style.display = 'none';
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleCreateTemplate();
        closeModal();
    });

    // Add exercise button in template
    document.getElementById('add-template-exercise-btn').addEventListener('click', () => {
        addTemplateExercise();
    });
}

let templateExerciseCounter = 0;

function resetTemplateForm() {
    document.getElementById('template-form').reset();
    document.getElementById('template-exercises-container').innerHTML = '';
    templateExerciseCounter = 0;
    addTemplateExercise(); // Add first exercise
}

function addTemplateExercise() {
    templateExerciseCounter++;
    const container = document.getElementById('template-exercises-container');
    
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-form';
    exerciseDiv.dataset.exerciseId = templateExerciseCounter;
    exerciseDiv.innerHTML = `
        <div class="exercise-header">
            <h4>Exercise ${templateExerciseCounter}</h4>
            <button type="button" class="btn-remove" onclick="removeTemplateExercise(${templateExerciseCounter})">✕</button>
        </div>
        <div class="form-group">
            <label>Exercise Name</label>
            <input type="text" class="template-exercise-name" required placeholder="e.g., Bench Press">
        </div>
        <div class="template-sets-container" data-exercise-id="${templateExerciseCounter}">
            <!-- Sets will be added here -->
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="addTemplateSet(${templateExerciseCounter})">+ Add Set</button>
    `;
    
    container.appendChild(exerciseDiv);
    addTemplateSet(templateExerciseCounter); // Add first set
}

function removeTemplateExercise(exerciseId) {
    const exerciseDiv = document.querySelector(`#template-exercises-container [data-exercise-id="${exerciseId}"].exercise-form`);
    if (exerciseDiv) {
        exerciseDiv.remove();
    }
}

function addTemplateSet(exerciseId) {
    const container = document.querySelector(`#template-exercises-container .template-sets-container[data-exercise-id="${exerciseId}"]`);
    const setCount = container.children.length + 1;
    
    const setDiv = document.createElement('div');
    setDiv.className = 'set-form';
    setDiv.innerHTML = `
        <span class="set-number">Set ${setCount}</span>
        <div class="set-inputs">
            <input type="number" class="template-set-weight" placeholder="Weight (kg)" step="0.5" min="0" required>
            <input type="number" class="template-set-reps" placeholder="Reps" min="1" required>
            <button type="button" class="btn-remove-small" onclick="removeTemplateSet(this)">✕</button>
        </div>
    `;
    
    container.appendChild(setDiv);
}

function removeTemplateSet(button) {
    const setDiv = button.closest('.set-form');
    const container = setDiv.parentElement;
    setDiv.remove();
    
    // Renumber remaining sets
    Array.from(container.children).forEach((set, idx) => {
        set.querySelector('.set-number').textContent = `Set ${idx + 1}`;
    });
}

function handleCreateTemplate() {
    const name = document.getElementById('template-name').value;
    const description = document.getElementById('template-description').value;
    
    const exerciseForms = document.querySelectorAll('#template-exercises-container .exercise-form');
    const exercises = [];
    
    exerciseForms.forEach(exerciseForm => {
        const exerciseName = exerciseForm.querySelector('.template-exercise-name').value;
        const setForms = exerciseForm.querySelectorAll('.set-form');
        
        const sets = [];
        setForms.forEach(setForm => {
            const weight = parseFloat(setForm.querySelector('.template-set-weight').value);
            const reps = parseInt(setForm.querySelector('.template-set-reps').value);
            sets.push({ weight, reps });
        });
        
        exercises.push({ name: exerciseName, sets });
    });
    
    const template = {
        name,
        description,
        exercises
    };
    
    templateManager.saveTemplate(template);
    renderTemplates();
    alert('Template saved successfully!');
}

