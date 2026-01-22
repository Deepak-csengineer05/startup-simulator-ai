import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import CustomSelect from '../shared/CustomSelect';

export default function SettingsModal({ isOpen, onClose }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({
        notifications: true,
        autoSave: true,
        analytics: false,
        emailDigest: true,
        language: 'English',
        timezone: 'UTC (Coordinated Universal Time)',
        fontSize: 'Medium',
    });
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [initialSettings, setInitialSettings] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Initialize settings from localStorage or user preferences
    useEffect(() => {
        // Try localStorage first
        const savedSettings = localStorage.getItem('userPreferences');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings(parsed);
                setInitialSettings(parsed);
                return;
            } catch (err) {
                console.error('Failed to parse saved settings:', err);
            }
        }

        // Fall back to user preferences
        if (user?.preferences) {
            const prefs = {
                notifications: user.preferences.notifications ?? true,
                autoSave: user.preferences.autoSave ?? true,
                analytics: user.preferences.analytics ?? false,
                emailDigest: user.preferences.emailDigest ?? true,
                language: user.preferences.language ?? 'English',
                timezone: user.preferences.timezone ?? 'UTC (Coordinated Universal Time)',
                fontSize: user.preferences.fontSize ?? 'Medium',
            };
            setSettings(prefs);
            setInitialSettings(prefs);
        }
    }, [user]);

    // Track dirty state
    useEffect(() => {
        const hasChanges = 
            settings.notifications !== initialSettings.notifications ||
            settings.autoSave !== initialSettings.autoSave ||
            settings.analytics !== initialSettings.analytics ||
            settings.emailDigest !== initialSettings.emailDigest ||
            settings.language !== initialSettings.language ||
            settings.timezone !== initialSettings.timezone ||
            settings.fontSize !== initialSettings.fontSize;
        setIsDirty(hasChanges);
    }, [settings, initialSettings]);

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSelectChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        // TODO: Send to backend when ready
        // await api.put('/users/preferences', settings);
        localStorage.setItem('userPreferences', JSON.stringify(settings));
        setLoading(false);
        setInitialSettings(settings);
        setIsDirty(false);
        onClose();
    };

    const handleDiscard = () => {
        setSettings(initialSettings);
        setIsDirty(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
    };

    const handleExportData = () => {
        // Export user data as JSON
        const dataToExport = {
            user,
            settings,
            exportDate: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `startup-simulator-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleDeleteAccount = async () => {
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            // Auto-cancel after 5 seconds
            setTimeout(() => setShowDeleteConfirm(false), 5000);
            return;
        }

        // TODO: Call backend API to delete account
        // await api.delete('/users/account');
        
        // Clear all local data
        localStorage.clear();
        sessionStorage.clear();
        
        // Logout and redirect
        await logout();
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 lg:p-16"
            onClick={onClose}
            onKeyDown={handleKeyDown}
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                animation: 'fadeIn 150ms ease-out',
            }}
        >
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .toggle-switch {
                    position: relative;
                    width: 44px;
                    height: 24px;
                    background: var(--color-bg-tertiary);
                    border-radius: var(--radius-full);
                    cursor: pointer;
                    transition: background 200ms;
                    border: 1px solid var(--color-border);
                    flex-shrink: 0;
                }
                .toggle-switch:hover {
                    background: var(--color-bg-active);
                }
                .toggle-switch::after {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 18px;
                    height: 18px;
                    background: var(--color-bg-card);
                    border-radius: 50%;
                    transition: transform 200ms;
                    box-shadow: var(--shadow-sm);
                }
                .toggle-switch.active {
                    background: var(--color-primary);
                    border-color: var(--color-primary);
                }
                .toggle-switch.active::after {
                    transform: translateX(20px);
                }
            `}</style>
            <div
                className="card w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-modal-title"
            >
                {/* Header */}
                <div className="px-4 py-4 sm:px-6 sm:py-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h2
                                id="settings-modal-title"
                                className="text-lg sm:text-xl"
                                style={{
                                    fontWeight: 'var(--font-weight-semibold)',
                                    color: 'var(--color-text-primary)',
                                }}
                            >
                                Settings
                            </h2>
                            <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                Manage your application preferences
                            </p>
                        </div>
                        <button
                            className="btn-ghost"
                            onClick={onClose}
                            aria-label="Close modal"
                            style={{ padding: '12px', marginRight: '-8px' }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5 sm:w-6 sm:h-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-4 pt-4 sm:px-6 sm:pt-6">
                    <div className="tab-list">
                        <button
                            className={`tab ${activeTab === 'general' ? 'active' : ''}`}
                            onClick={() => setActiveTab('general')}
                        >
                            General
                        </button>
                        <button
                            className={`tab ${activeTab === 'appearance' ? 'active' : ''}`}
                            onClick={() => setActiveTab('appearance')}
                        >
                            Appearance
                        </button>
                        <button
                            className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('notifications')}
                        >
                            Notifications
                        </button>
                        <button
                            className={`tab ${activeTab === 'privacy' ? 'active' : ''}`}
                            onClick={() => setActiveTab('privacy')}
                        >
                            Privacy
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                    {activeTab === 'general' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div
                                style={{
                                    padding: '16px',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--color-border)',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                                            Auto-save Sessions
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                                            Automatically save your progress
                                        </div>
                                    </div>
                                    <div
                                        className={`toggle-switch ${settings.autoSave ? 'active' : ''}`}
                                        onClick={() => handleToggle('autoSave')}
                                    />
                                </div>
                            </div>
                            <CustomSelect
                                label="Language"
                                value={settings.language}
                                onChange={(value) => handleSelectChange('language', value)}
                                options={['English', 'Español', 'Français', 'Deutsch']}
                            />
                            <CustomSelect
                                label="Time Zone"
                                value={settings.timezone}
                                onChange={(value) => handleSelectChange('timezone', value)}
                                options={[
                                    'UTC (Coordinated Universal Time)',
                                    'EST (Eastern Standard Time)',
                                    'PST (Pacific Standard Time)',
                                    'GMT (Greenwich Mean Time)',
                                ]}
                            />
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div
                                style={{
                                    padding: '16px',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--color-border)',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                                            Dark Mode
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                                            Switch to dark theme
                                        </div>
                                    </div>
                                    <div
                                        className={`toggle-switch ${theme === 'dark' ? 'active' : ''}`}
                                        onClick={toggleTheme}
                                    />
                                </div>
                            </div>
                            <CustomSelect
                                label="Font Size"
                                value={settings.fontSize}
                                onChange={(value) => handleSelectChange('fontSize', value)}
                                options={['Small', 'Medium', 'Large']}
                            />
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div
                                style={{
                                    padding: '16px',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--color-border)',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                                            Push Notifications
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                                            Receive in-app notifications
                                        </div>
                                    </div>
                                    <div
                                        className={`toggle-switch ${settings.notifications ? 'active' : ''}`}
                                        onClick={() => handleToggle('notifications')}
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: '16px',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--color-border)',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                                            Email Digest
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                                            Weekly summary of your activity
                                        </div>
                                    </div>
                                    <div
                                        className={`toggle-switch ${settings.emailDigest ? 'active' : ''}`}
                                        onClick={() => handleToggle('emailDigest')}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div
                                style={{
                                    padding: '16px',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--color-border)',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                                            Analytics
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                                            Help us improve with usage data
                                        </div>
                                    </div>
                                    <div
                                        className={`toggle-switch ${settings.analytics ? 'active' : ''}`}
                                        onClick={() => handleToggle('analytics')}
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: '16px',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--color-border)',
                                }}
                            >
                                <div style={{ marginBottom: '8px' }}>
                                    <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-primary)' }}>
                                        Data Management
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                        Control your data and privacy
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                                    <button 
                                        className="btn btn-secondary" 
                                        style={{ fontSize: 'var(--font-size-body-sm)', padding: 'var(--space-2) var(--space-4)' }}
                                        onClick={handleExportData}
                                    >
                                        Export Data
                                    </button>
                                    {!showDeleteConfirm ? (
                                        <button 
                                            className="btn btn-secondary" 
                                            style={{ fontSize: 'var(--font-size-body-sm)', padding: 'var(--space-2) var(--space-4)' }}
                                            onClick={handleDeleteAccount}
                                        >
                                            Delete Account
                                        </button>
                                    ) : (
                                        <>
                                            <button 
                                                className="btn btn-secondary" 
                                                style={{ fontSize: 'var(--font-size-body-sm)', padding: 'var(--space-2) var(--space-4)' }}
                                                onClick={handleCancelDelete}
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                className="btn btn-secondary" 
                                                style={{ 
                                                    fontSize: 'var(--font-size-body-sm)', 
                                                    padding: 'var(--space-2) var(--space-4)',
                                                    background: 'var(--color-error)',
                                                    color: 'var(--color-text-inverse)',
                                                    borderColor: 'var(--color-error)',
                                                }}
                                                onClick={handleDeleteAccount}
                                            >
                                                Confirm Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                                {showDeleteConfirm && (
                                    <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-error)', marginTop: '8px' }}>
                                        ⚠️ This action cannot be undone. All your data will be permanently deleted.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 px-4 py-4 sm:px-6 sm:py-6"
                    style={{
                        borderTop: '1px solid var(--color-border)',
                    }}
                >
                    <button
                        className="btn btn-secondary w-full sm:w-auto"
                        onClick={handleDiscard}
                        disabled={!isDirty || loading}
                    >
                        Discard
                    </button>
                    <button
                        className="btn btn-primary w-full sm:w-auto"
                        onClick={handleSave}
                        disabled={!isDirty || loading}
                    >
                        {loading ? 'Saving...' : 'Save changes'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
