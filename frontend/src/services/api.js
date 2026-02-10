import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        // Handle common errors
        if (error.response?.status === 401) {
            // Redirect to login if unauthorized (except for auth check and login/register)
            const skipRedirectUrls = ['/auth/me', '/auth/login', '/auth/register'];
            if (!skipRedirectUrls.some(url => error.config.url.includes(url))) {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// Auth API functions
export const authApi = {
    // Register with email/password
    register: async (data) => {
        const response = await api.post('/auth/register', {
            email: data.email,
            password: data.password,
            name: data.name
        });
        return response.data;
    },

    // Login with email/password
    login: async (data) => {
        const response = await api.post('/auth/login', {
            email: data.email,
            password: data.password
        });
        return response.data;
    },

    // Logout
    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    // Get current user
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    }
};

// Session API functions
export const sessionApi = {
    // Create a new session
    create: async (data, config = {}) => {
        const response = await api.post('/api/sessions', {
            idea_text: data.ideaText,
            domain_hint: data.domain,
            tone_preference: data.tone
        }, config);
        return response.data;
    },

    // Generate all outputs for a session
    generate: async (sessionId, config = {}) => {
        const response = await api.post(`/api/sessions/${sessionId}/generate`, {}, config);
        return response.data;
    },

    // Regenerate a specific module
    regenerate: async (sessionId, moduleName) => {
        const response = await api.post(`/api/sessions/${sessionId}/regenerate/${moduleName}`);
        return response.data;
    },

    // Get session outputs (for polling)
    getOutputs: async (sessionId) => {
        const response = await api.get(`/api/sessions/${sessionId}/core_outputs`);
        return response.data;
    },

    // Get single session
    get: async (sessionId) => {
        const response = await api.get(`/api/sessions/${sessionId}`);
        return response.data;
    },

    // List user's sessions
    list: async () => {
        const response = await api.get('/api/sessions');
        return response.data;
    },

    // Delete a session
    delete: async (sessionId) => {
        const response = await api.delete(`/api/sessions/${sessionId}`);
        return response.data;
    }
};

export default api;
