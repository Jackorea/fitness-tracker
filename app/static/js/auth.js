// Authentication utility functions

class AuthManager {
    constructor() {
        this.tokenKey = 'fitness_tracker_token';
        this.emailKey = 'fitness_tracker_email';
    }

    // Save authentication token
    saveToken(token, email) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.emailKey, email);
    }

    // Get authentication token
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // Get user email
    getEmail() {
        return localStorage.getItem(this.emailKey);
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    }

    // Clear authentication data
    clearAuth() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.emailKey);
    }

    // Get authorization header
    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
}

// Create singleton instance
const authManager = new AuthManager();

