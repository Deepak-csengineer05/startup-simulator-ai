import { createContext, useContext, useState, useEffect } from 'react';
import api, { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check authentication status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            setLoading(true);

            // Check if user is authenticated via backend
            const response = await api.get('/auth/me');
            const userData = response.data.user;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            setError(null);
        } catch (err) {
            // Clear any stale user data
            setUser(null);
            localStorage.removeItem('user');
            
            // 401 is expected when not logged in
            if (err.response?.status !== 401) {
                console.error('Auth check failed:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    // Google OAuth login
    const loginWithGoogle = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || ''}/auth/google`;
    };

    // Email/password login
    const loginWithEmail = async (email, password) => {
        try {
            setError(null);
            const response = await authApi.login({ email, password });
            setUser(response.user);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.error || 'Login failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    // Register new account
    const register = async (name, email, password) => {
        try {
            setError(null);
            const response = await authApi.register({ name, email, password });
            setUser(response.user);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.error || 'Registration failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
            setUser(null);
            localStorage.removeItem('user');
            window.location.href = '/login';
        } catch (err) {
            console.error('Logout failed:', err);
            // Still clear user on error
            setUser(null);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            // TODO: Send to backend when ready
            // const response = await api.put('/users/profile', profileData);

            // For now, update locally and persist to localStorage
            const updatedUser = { ...user, ...profileData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.error || 'Update failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        loginWithGoogle,
        loginWithEmail,
        register,
        logout,
        checkAuth,
        updateProfile, // New method
        setError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
