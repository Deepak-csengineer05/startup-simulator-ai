import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket, Sparkles, Zap, Target, Palette, Code, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

function Login() {
    const { loginWithGoogle, loginWithEmail, register, error, setError } = useAuth();
    const navigate = useNavigate();

    const [isRegister, setIsRegister] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const features = [
        { icon: Target, label: 'Validate Ideas', desc: 'Get structured problem/solution analysis' },
        { icon: Palette, label: 'Brand Identity', desc: 'Names, taglines, and color palettes' },
        { icon: Zap, label: 'Landing Copy', desc: 'Headlines, CTAs, and pricing' },
        { icon: Sparkles, label: 'Market Analysis', desc: 'TAM/SAM/SOM and competitor research' },
        { icon: Rocket, label: 'Pitch Deck', desc: '10-slide investor-ready outline' },
        { icon: Code, label: 'Tech Stack', desc: 'Architecture and code samples' }
    ];

    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let result;
            if (isRegister) {
                result = await register(formData.name, formData.email, formData.password);
            } else {
                result = await loginWithEmail(formData.email, formData.password);
            }

            if (result.success) {
                navigate('/dashboard');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegister(!isRegister);
        setError(null);
        setFormData({ name: '', email: '', password: '' });
    };

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--gradient-hero)' }}>
            {/* Left side - Branding */}
            <div className="hidden lg:flex w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden">
                {/* Animated background shapes */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute w-96 h-96 rounded-full opacity-20"
                        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)', top: '10%', left: '20%' }}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="absolute w-64 h-64 rounded-full opacity-20"
                        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)', bottom: '20%', right: '10%' }}
                        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.2, 0.3] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>

                <motion.div
                    className="relative z-10 text-center text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div
                        className="flex items-center justify-center gap-3 mb-6"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                    >
                        <div className="p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                            <Rocket className="w-10 h-10" />
                        </div>
                    </motion.div>

                    <h1 className="text-5xl font-bold mb-4">
                        Startup Simulator
                        <span className="block text-3xl font-medium opacity-90 mt-2">AI</span>
                    </h1>

                    <p className="text-xl opacity-90 max-w-md mx-auto mb-12">
                        Transform your startup idea into a complete business package in 30 seconds
                    </p>

                    {/* Feature grid */}
                    <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.label}
                                className="flex items-center gap-3 p-3 rounded-xl text-left"
                                style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)' }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                            >
                                <feature.icon className="w-5 h-5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-sm">{feature.label}</p>
                                    <p className="text-xs opacity-75">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Right side - Login/Register */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <div
                        className="card p-8 shadow-2xl"
                        style={{
                            background: 'var(--color-bg-card)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                    >
                        {/* Mobile logo */}
                        <div className="lg:hidden text-center mb-8">
                            <div className="inline-flex items-center gap-2 mb-4">
                                <div className="p-2 rounded-xl" style={{ background: 'var(--gradient-button)' }}>
                                    <Rocket className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl font-bold gradient-text">Startup Simulator AI</span>
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                {isRegister ? 'Create Account' : 'Welcome Back'}
                            </h2>
                            <p style={{ color: 'var(--color-text-secondary)' }}>
                                {isRegister ? 'Sign up to start building your startup' : 'Sign in to continue building your startup'}
                            </p>
                        </div>

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-2 p-3 rounded-lg mb-4"
                                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)' }}
                                >
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Email/Password Form */}
                        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                            {isRegister && (
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="John Doe"
                                            className="input pl-10"
                                            required={isRegister}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="you@example.com"
                                        className="input pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder={isRegister ? 'Min 6 characters' : '••••••••'}
                                        className="input pl-10"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary w-full"
                                whileHover={!isLoading ? { scale: 1.02 } : {}}
                                whileTap={!isLoading ? { scale: 0.98 } : {}}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 spinner" />
                                ) : isRegister ? (
                                    'Create Account'
                                ) : (
                                    'Sign In'
                                )}
                            </motion.button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }} />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4" style={{ background: 'var(--color-bg-card)', color: 'var(--color-text-muted)' }}>
                                    or continue with
                                </span>
                            </div>
                        </div>

                        {/* Google Sign In Button */}
                        <motion.button
                            onClick={loginWithGoogle}
                            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl font-semibold transition-all"
                            style={{
                                background: 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-primary)'
                            }}
                            whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>Google</span>
                        </motion.button>

                        {/* Toggle Login/Register */}
                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="text-sm transition-colors"
                                style={{ color: 'var(--color-accent)' }}
                            >
                                {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <motion.div
                        className="mt-8 flex justify-center gap-8 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="text-white">
                            <p className="text-2xl font-bold">30s</p>
                            <p className="text-sm opacity-75">Generation Time</p>
                        </div>
                        <div className="text-white">
                            <p className="text-2xl font-bold">6</p>
                            <p className="text-sm opacity-75">Complete Views</p>
                        </div>
                        <div className="text-white">
                            <p className="text-2xl font-bold">Free</p>
                            <p className="text-sm opacity-75">No Credit Card</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

export default Login;
