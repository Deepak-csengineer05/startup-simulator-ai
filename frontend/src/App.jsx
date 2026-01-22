import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/shared/Toast';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import { Loader2 } from 'lucide-react';


// Protected route wrapper
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ background: 'var(--color-bg-primary)' }}>
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 spinner" style={{ color: 'var(--color-accent)' }} />
                    <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// Public route - redirect to dashboard if already logged in
function PublicRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ background: 'var(--color-bg-primary)' }}>
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 spinner" style={{ color: 'var(--color-accent)' }} />
                    <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

function AppRoutes() {
    return (
        <Routes>
            {/* Dashboard */}
            <Route path="/dashboard" element={
                <Layout>
                    <Dashboard />
                </Layout>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <ThemeProvider>
            <ToastProvider>
                <AuthProvider>
                    <BrowserRouter>
                        <AppRoutes />
                    </BrowserRouter>
                </AuthProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}

export default App;
