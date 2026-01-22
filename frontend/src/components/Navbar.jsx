import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Moon, Sun, Settings as SettingsIcon, User, LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileModal from './modals/ProfileModal';
import SettingsModal from './modals/SettingsModal';

/**
 * Enhanced Navbar Component
 * - User dropdown menu with animations
 * - Active route highlighting
 * - Keyboard navigation support
 * - Mobile responsive
 */

function Navbar() {
    const { isDark, toggleTheme } = useTheme();
    const { user } = useAuth();
    const location = useLocation();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    // Don't render if user isn't loaded yet
    if (!user) {
        return null;
    }

    const isActive = (path) => location.pathname === path;

    return (
        <nav
            className="sticky top-0 z-50 border-b backdrop-blur-md"
            style={{
                background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                borderColor: 'var(--color-border)',
            }}
        >
            <div
                className="max-w-[1400px] mx-auto px-3 sm:px-4 h-14 flex items-center justify-between"
            >
                {/* Logo Area */}
                <div className="flex items-center gap-2" style={{ marginLeft: 'var(--space-4)' }}>
                    <img
                        src="/logo-primary.png"
                        alt="Logo"
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            objectFit: 'contain'
                        }}
                    />
                    <div className="hidden md:block">
                        <h1
                            className="text-base font-bold"
                            style={{
                                background: 'var(--gradient-primary)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Startup Simulator AI
                        </h1>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
                    {/* Theme Toggle */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleTheme}
                        className="p-2 rounded-lg transition-colors"
                        style={{
                            color: 'var(--color-text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--color-bg-hover)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {isDark ? (
                            <Sun style={{ width: '20px', height: '20px' }} />
                        ) : (
                            <Moon style={{ width: '20px', height: '20px' }} />
                        )}
                    </motion.button>

                    {/* Divider */}
                    <div
                        style={{
                            height: '24px',
                            width: '1px',
                            background: 'var(--color-border)',
                            margin: '0 var(--space-1)',
                        }}
                    />

                    {/* Settings Button */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsSettingsModalOpen(true)}
                        className="p-2 rounded-lg transition-colors"
                        style={{
                            color: 'var(--color-text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--color-bg-hover)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                        aria-label="Settings"
                    >
                        <SettingsIcon style={{ width: '20px', height: '20px' }} />
                    </motion.button>

                    {/* User Menu */}
                    <div className="relative">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center rounded-lg transition-all"
                            style={{
                                gap: 'var(--space-2)',
                                padding: 'var(--space-1) var(--space-2)',
                                border: '2px solid transparent',
                                borderColor: isUserMenuOpen ? 'var(--color-border-hover)' : 'transparent',
                            }}
                            onMouseEnter={(e) => {
                                if (!isUserMenuOpen) {
                                    e.currentTarget.style.borderColor = 'var(--color-border)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isUserMenuOpen) {
                                    e.currentTarget.style.borderColor = 'transparent';
                                }
                            }}
                            aria-label="User menu"
                            aria-expanded={isUserMenuOpen}
                        >
                            {/* Avatar */}
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{
                                    background: 'var(--gradient-primary)',
                                    color: 'var(--color-text-inverse)',
                                    fontSize: 'var(--font-size-body-sm)',
                                    fontWeight: 'var(--font-weight-semibold)',
                                }}
                            >
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    user.name.charAt(0).toUpperCase()
                                )}
                            </div>

                            {/* Name (hidden on mobile) */}
                            <span
                                className="hidden sm:block font-medium"
                                style={{
                                    fontSize: 'var(--font-size-body-sm)',
                                    color: 'var(--color-text-primary)',
                                }}
                            >
                                {user.name}
                            </span>

                            {/* Chevron */}
                            <motion.div
                                animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        color: 'var(--color-text-muted)',
                                    }}
                                />
                            </motion.div>
                        </motion.button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {isUserMenuOpen && (
                                <>
                                    {/* Backdrop */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsUserMenuOpen(false)}
                                        style={{ background: 'transparent' }}
                                    />

                                    {/* Menu */}
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute w-64 rounded-lg shadow-lg overflow-hidden z-50"
                                        style={{
                                            right: 'var(--space-2)', // Add margin from right edge
                                            top: 'calc(100% + var(--space-4))', // Better top spacing
                                            background: 'var(--color-bg-card)',
                                            border: '1px solid var(--color-border)',
                                            boxShadow: 'var(--shadow-xl)',
                                        }}
                                    >
                                        {/* User Info */}
                                        <div
                                            className="px-4 py-4 border-b margin-left-2"
                                            style={{
                                                borderColor: 'var(--color-border)',
                                                background: 'var(--color-bg-secondary)',
                                            }}
                                        >
                                            {/* Avatar + Info */}
                                            <div className="flex items-center" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                                                {/* Larger Avatar */}
                                                <div
                                                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                                                    style={{
                                                        background: 'var(--gradient-primary)',
                                                        color: 'var(--color-text-inverse)',
                                                        fontSize: 'var(--font-size-h4)',
                                                        fontWeight: 'var(--font-weight-bold)',
                                                        boxShadow: 'var(--shadow-md)',
                                                    }}
                                                >
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        user.name.charAt(0).toUpperCase()
                                                    )}
                                                </div>

                                                {/* Name and Email */}
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className="font-semibold truncate"
                                                        style={{
                                                            fontSize: 'var(--font-size-body)',
                                                            color: 'var(--color-text-primary)',
                                                            marginBottom: 'var(--space-1)',
                                                        }}
                                                    >
                                                        {user.name}
                                                    </p>
                                                    <p
                                                        className="truncate"
                                                        style={{
                                                            fontSize: 'var(--font-size-body-sm)',
                                                            color: 'var(--color-text-muted)',
                                                        }}
                                                    >
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <div style={{ padding: 'var(--space-2)' }}>
                                            <MenuButton
                                                icon={User}
                                                label="Profile"
                                                onClick={() => {
                                                    setIsUserMenuOpen(false);
                                                    setIsProfileModalOpen(true);
                                                }}
                                            />
                                            <MenuButton
                                                icon={SettingsIcon}
                                                label="Settings"
                                                onClick={() => {
                                                    setIsUserMenuOpen(false);
                                                    setIsSettingsModalOpen(true);
                                                }}
                                            />
                                            <div
                                                style={{
                                                    height: '1px',
                                                    background: 'var(--color-border)',
                                                    margin: 'var(--space-2) 0',
                                                }}
                                            />
                                            <MenuButton
                                                icon={LogOut}
                                                label="Sign out"
                                                onClick={() => {
                                                    setIsUserMenuOpen(false);
                                                    // Handle logout
                                                }}
                                                variant="danger"
                                            />
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
        </nav>
    );
}

// Menu Button Component
function MenuButton({ icon: Icon, label, onClick, variant = 'default' }) {
    return (
        <motion.button
            onClick={onClick}
            className="w-full flex items-center rounded-lg transition-colors text-left"
            style={{
                gap: 'var(--space-3)',
                padding: 'var(--space-3)', // Increased from space-2
                fontSize: 'var(--font-size-body-sm)',
                color: variant === 'danger' ? 'var(--color-error)' : 'var(--color-text-primary)',
                borderRadius: 'var(--radius-md)',
            }}
            whileHover={{ scale: 1.02, x: 4 }} // Added scale
            whileTap={{ scale: 0.98 }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = variant === 'danger'
                    ? 'var(--color-error-bg)'
                    : 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
            }}
        >
            {variant === 'danger' ? (
                <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.4 }}
                    style={{ display: 'flex', alignItems: 'center' }}
                >
                    <Icon style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                </motion.div>
            ) : (
                <Icon style={{ width: '20px', height: '20px', flexShrink: 0 }} />
            )}
            <span style={{ flex: 1 }}>{label}</span>
        </motion.button>
    );
}

export default Navbar;
