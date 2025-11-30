// API client for backend communication

const API_BASE_URL = '';  // Empty string because we're on the same domain

class APIClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    // Helper method for making requests
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication endpoints
    async login(email, password) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch(`${this.baseUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Login failed');
        }

        return data;
    }

    async signup(email, password) {
        return this.request('/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    // Workout endpoints
    async getMyWorkouts(skip = 0, limit = 100) {
        return this.request(`/workouts/?skip=${skip}&limit=${limit}`, {
            headers: authManager.getAuthHeader(),
        });
    }

    async getPublicWorkouts(skip = 0, limit = 100) {
        return this.request(`/workouts/public?skip=${skip}&limit=${limit}`, {
            headers: authManager.getAuthHeader(),
        });
    }

    async getWorkout(workoutId) {
        return this.request(`/workouts/${workoutId}`, {
            headers: authManager.getAuthHeader(),
        });
    }

    async createWorkout(workoutData) {
        return this.request('/workouts/', {
            method: 'POST',
            headers: authManager.getAuthHeader(),
            body: JSON.stringify(workoutData),
        });
    }
}

// Create singleton instance
const apiClient = new APIClient();

