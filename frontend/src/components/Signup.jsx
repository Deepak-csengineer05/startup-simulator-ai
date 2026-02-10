import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Lightbulb,
    Palette,
    FileText,
    TrendingUp,
    Presentation,
    Code,
    CheckCircle,
    AlertCircle,
    Loader2,
    Check,
    X,
    Eye,
    EyeOff
} from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import './Auth.css';

function Signup() {
    const { loginWithGoogle, register, error, setError } = useAuth();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [passwordStrength, setPasswordStrength] = useState(0);

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        return strength;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }

        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const result = await register(formData.name, formData.email, formData.password);
            if (result.success) {
                navigate('/dashboard');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength <= 1) return '#ef4444';
        if (passwordStrength <= 3) return '#f59e0b';
        return '#10b981';
    };

    const getStrengthText = () => {
        if (passwordStrength <= 1) return 'Weak';
        if (passwordStrength <= 3) return 'Medium';
        return 'Strong';
    };

    return (
        <div className="auth-container">
            {/* Main Content */}
            <motion.div
                className="auth-wrapper"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                {/* Left Side - Branding */}
                <motion.div
                    className="auth-brand-side"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="auth-brand-content">
                        <img 
                            src="/logo-primary.png" 
                            alt="Startup Simulator AI" 
                            className="auth-brand-logo"
                        />
                        <h3 className="auth-brand-name">
                            Startup Simulator AI
                        </h3>
                        <h2 className="auth-brand-title">
                            Transform Ideas Into Reality
                        </h2>
                        <p className="auth-brand-subtitle">
                            Generate complete business packages with AI-powered insights in under a minute
                        </p>
                        
                        <div className="auth-brand-features">
                            <div className="auth-brand-feature-icon">
                                <CheckCircle />
                            </div>
                            <div className="auth-brand-feature-icon">
                                <Palette />
                            </div>
                            <div className="auth-brand-feature-icon">
                                <FileText />
                            </div>
                            <div className="auth-brand-feature-icon">
                                <TrendingUp />
                            </div>
                            <div className="auth-brand-feature-icon">
                                <Presentation />
                            </div>
                            <div className="auth-brand-feature-icon">
                                <Code />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Form */}
                <motion.div
                    className="auth-form-side"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="auth-form-header">
                        <h1 className="auth-form-title">
                            Create Your Account. <span className="highlight">Free.</span>
                        </h1>
                        <p className="auth-form-subtitle">
                            Join and launch your startup idea in under a minute.
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

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-input-group">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Full Name (e.g., John Doe)"
                                className="auth-input"
                                required
                            />
                        </div>

                        <div className="auth-input-group">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Your Email (e.g., idea@founder.com)"
                                className="auth-input"
                                required
                            />
                        </div>

                        <div className="auth-input-group">
                            <div className="auth-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Password (Min 6 characters)"
                                    className="auth-input has-toggle"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="auth-password-toggle"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="password-strength">
                                    <div className="password-strength-bar">
                                        <div 
                                            className="password-strength-fill"
                                            style={{
                                                width: `${(passwordStrength / 5) * 100}%`,
                                                backgroundColor: getStrengthColor()
                                            }}
                                        />
                                    </div>
                                    <span 
                                        className="password-strength-text"
                                        style={{ color: getStrengthColor() }}
                                    >
                                        {getStrengthText()}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="auth-input-group">
                            <div className="auth-input-wrapper">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm Password"
                                    className="auth-input has-toggle"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="auth-password-toggle"
                                    aria-label="Toggle confirm password visibility"
                                >
                                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                                </button>
                            </div>
                            {formData.confirmPassword && (
                                <div 
                                    className="password-match"
                                    style={{
                                        color: formData.password === formData.confirmPassword 
                                            ? 'var(--color-success)' 
                                            : 'var(--color-error)'
                                    }}
                                >
                                    {formData.password === formData.confirmPassword ? (
                                        <>
                                            <Check size={14} />
                                            <span>Passwords match</span>
                                        </>
                                    ) : (
                                        <>
                                            <X size={14} />
                                            <span>Passwords don't match</span>
                                        </>
                                    )}
                                </div>
                            )}
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
                                'Create Account'
                            )}
                        </motion.button>

                        <div className="auth-divider">or</div>

                        <motion.button
                            type="button"
                            onClick={loginWithGoogle}
                            className="auth-btn auth-btn-google"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <FaGoogle />
                            Sign up with Google
                        </motion.button>
                    </form>

                    <div className="auth-footer">
                        <div className="auth-footer-links">
                            <Link to="/login" className="auth-link">
                                Already have an account? Sign in
                            </Link>
                        </div>
                        <p className="auth-footer-text" style={{ marginTop: 'var(--space-4)' }}>
                            Secure • Encrypted • Privacy Protected
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default Signup;
