import { motion } from 'framer-motion';
import { Moon, Sun, Bell, Lock, Trash2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from './shared/Toast';

function Settings() {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const { showToast } = useToast();
    const [settings, setSettings] = useState({
        emailNotifications: true,
        projectUpdates: true,
        marketingEmails: false,
        autoSave: true,
    });

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    const handleToggle = (key) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        // Auto-save to localStorage
        localStorage.setItem('appSettings', JSON.stringify(newSettings));
    };

    const handleSave = () => {
        // Save to localStorage
        localStorage.setItem('appSettings', JSON.stringify(settings));
        showToast('Settings saved successfully!', 'success');
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)', paddingTop: '3.5rem' }}>
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        Settings
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 rounded-lg"
                        style={{
                            background: 'var(--color-bg-secondary)',
                            color: 'var(--color-text-secondary)',
                            border: '1px solid var(--color-border)',
                        }}
                    >
                        Back
                    </motion.button>
                </div>

                {/* Settings Sections */}
                <div className="space-y-6">
                    {/* Appearance */}
                    <SettingsSection
                        title="Appearance"
                        description="Customize how the app looks"
                        icon={isDark ? Moon : Sun}
                    >
                        <div className="flex items-center justify-between p-4 rounded-lg"
                            style={{ background: 'var(--color-bg-secondary)' }}
                        >
                            <div>
                                <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                    Dark Mode
                                </p>
                                <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-muted)' }}>
                                    {isDark ? 'Dark theme enabled' : 'Light theme enabled'}
                                </p>
                            </div>
                            <Toggle isOn={isDark} onToggle={toggleTheme} />
                        </div>
                    </SettingsSection>

                    {/* Notifications */}
                    <SettingsSection
                        title="Notifications"
                        description="Manage your notification preferences"
                        icon={Bell}
                    >
                        <div className="space-y-3">
                            <ToggleSetting
                                label="Email Notifications"
                                description="Receive email updates about your account"
                                isOn={settings.emailNotifications}
                                onToggle={() => handleToggle('emailNotifications')}
                            />
                            <ToggleSetting
                                label="Project Updates"
                                description="Get notified about project milestones"
                                isOn={settings.projectUpdates}
                                onToggle={() => handleToggle('projectUpdates')}
                            />
                            <ToggleSetting
                                label="Marketing Emails"
                                description="Receive news and promotional content"
                                isOn={settings.marketingEmails}
                                onToggle={() => handleToggle('marketingEmails')}
                            />
                        </div>
                    </SettingsSection>

                    {/* Preferences */}
                    <SettingsSection
                        title="Preferences"
                        description="Application behavior settings"
                        icon={Lock}
                    >
                        <div className="space-y-3">
                            <ToggleSetting
                                label="Auto-Save"
                                description="Automatically save your work"
                                isOn={settings.autoSave}
                                onToggle={() => handleToggle('autoSave')}
                            />
                        </div>
                    </SettingsSection>

                    {/* Danger Zone */}
                    <SettingsSection
                        title="Danger Zone"
                        description="Irreversible actions"
                        icon={Trash2}
                        danger
                    >
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                                    // TODO: Implement account deletion
                                    alert('Account deletion not implemented yet');
                                }
                            }}
                            className="w-full p-4 rounded-lg text-left font-medium"
                            style={{
                                background: 'var(--color-error-bg)',
                                color: 'var(--color-error)',
                                border: '1px solid var(--color-error)',
                            }}
                        >
                            Delete Account
                        </motion.button>
                    </SettingsSection>
                </div>

                {/* Save Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        className="w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold"
                        style={{
                            background: 'var(--gradient-primary)',
                            color: 'white',
                        }}
                    >
                        <Save style={{ width: '18px', height: '18px' }} />
                        Save All Changes
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
}

// Settings Section Component
function SettingsSection({ title, description, icon: Icon, children, danger = false }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-6"
            style={{
                background: 'var(--color-bg-card)',
                border: `1px solid ${danger ? 'var(--color-error)' : 'var(--color-border)'}`,
                boxShadow: 'var(--shadow-md)',
            }}
        >
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="p-2 rounded-lg"
                    style={{
                        background: danger ? 'var(--color-error-bg)' : 'var(--color-bg-secondary)',
                        color: danger ? 'var(--color-error)' : 'var(--color-primary)',
                    }}
                >
                    <Icon style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                    <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {title}
                    </h3>
                    <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-muted)' }}>
                        {description}
                    </p>
                </div>
            </div>
            {children}
        </motion.div>
    );
}

// Toggle Setting Component
function ToggleSetting({ label, description, isOn, onToggle }) {
    return (
        <div
            className="flex items-center justify-between p-4 rounded-lg"
            style={{ background: 'var(--color-bg-secondary)' }}
        >
            <div className="flex-1">
                <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {label}
                </p>
                <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-muted)' }}>
                    {description}
                </p>
            </div>
            <Toggle isOn={isOn} onToggle={onToggle} />
        </div>
    );
}

// Toggle Component
function Toggle({ isOn, onToggle }) {
    return (
        <motion.button
            onClick={onToggle}
            className="relative rounded-full"
            style={{
                width: '44px',
                height: '24px',
                background: isOn ? 'var(--color-primary)' : 'var(--color-bg-hover)',
                flexShrink: 0,
            }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.div
                className="absolute top-1 rounded-full"
                style={{
                    width: '16px',
                    height: '16px',
                    background: 'white',
                }}
                animate={{
                    left: isOn ? '24px' : '4px',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        </motion.button>
    );
}

export default Settings;
