import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2, CheckCircle, ArrowLeft, Mail, Send, KeyRound, Shield, Lock } from 'lucide-react';
import './Auth.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // TODO: Implement forgot password API call
            // const response = await api.post('/auth/forgot-password', { email });

            // Simulating API call for now
            await new Promise(resolve => setTimeout(resolve, 1500));

            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Main Content */}
            <motion.div
                className="auth-wrapper auth-wrapper-forgot"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                {/* Left Brand Panel */}
                <motion.div
                    className="forgot-password-brand-side"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="forgot-password-brand-content">
                        <motion.div
                            className="forgot-password-icon-large"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        >
                            <KeyRound />
                        </motion.div>

                        <motion.h2
                            className="forgot-password-brand-title"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            Secure Password Recovery
                        </motion.h2>

                        <motion.p
                            className="forgot-password-brand-text"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            We'll send you a secure link to reset your password and get you back on track.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            style={{
                                marginTop: 'var(--space-8)',
                                display: 'flex',
                                gap: 'var(--space-6)',
                                justifyContent: 'center',
                                opacity: 0.9
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Shield size={32} />
                                <span style={{ fontSize: 'var(--font-size-body-sm)' }}>Secure</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Mail size={32} />
                                <span style={{ fontSize: 'var(--font-size-body-sm)' }}>Email Verified</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Lock size={32} />
                                <span style={{ fontSize: 'var(--font-size-body-sm)' }}>Encrypted</span>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Right Form Panel */}
                <motion.div
                    className="forgot-password-form-side"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {!success ? (
                        <>
                            <div className="forgot-password-header">
                                <h1 className="auth-form-title">
                                    Reset Your <span className="highlight">Password</span>
                                </h1>
                                <p className="auth-form-subtitle">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>
                            </div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="auth-alert auth-alert-error"
                                    >
                                        <AlertCircle />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Reset Form */}
                            <form onSubmit={handleSubmit} className="auth-form forgot-password-form">
                                <div className="auth-input-group">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError(null);
                                        }}
                                        placeholder="Your Email (e.g., idea@founder.com)"
                                        className="auth-input"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    className="auth-btn auth-btn-primary"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    {isLoading ? (
                                        <Loader2 className="auth-spinner" size={20} />
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Send Reset Link
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            <Link to="/login" className="forgot-password-back-link">
                                <ArrowLeft />
                                Back to Login
                            </Link>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="auth-success-state"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className="auth-success-icon"
                            >
                                <CheckCircle />
                            </motion.div>

                            <div className="auth-form-header">
                                <h1 className="auth-form-title">
                                    Check Your <span className="highlight">Email</span>
                                </h1>
                                <p className="auth-form-subtitle" style={{ marginTop: 'var(--space-3)' }}>
                                    We've sent a password reset link to
                                </p>
                                <p className="auth-form-subtitle" style={{ 
                                    fontWeight: 'var(--font-weight-semibold)', 
                                    color: 'var(--color-text-primary)',
                                    marginTop: 'var(--space-2)'
                                }}>
                                    {email}
                                </p>
                                <p className="auth-form-subtitle" style={{ fontSize: 'var(--font-size-body-sm)', marginTop: 'var(--space-4)', opacity: 0.8 }}>
                                    Didn't receive the email? Check your spam folder or try again.
                                </p>
                            </div>

                            <div className="auth-form" style={{ marginTop: 'var(--space-8)' }}>
                                <Link to="/login" style={{ textDecoration: 'none' }}>
                                    <motion.button
                                        className="auth-btn auth-btn-primary"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        <ArrowLeft size={18} />
                                        Back to Login
                                    </motion.button>
                                </Link>

                                <motion.button
                                    onClick={() => {
                                        setSuccess(false);
                                        setEmail('');
                                    }}
                                    className="auth-btn auth-btn-google"
                                    style={{ marginTop: 'var(--space-3)' }}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    <Send size={18} />
                                    Resend Email
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}

export default ForgotPassword;
