import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProfileModal({ isOpen, onClose }) {
    const { user, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Initialize form data from user
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                role: user.role || '',
                company: user.company || '',
                bio: user.bio || '',
            });
        }
    }, [user]);

    // Track dirty state
    useEffect(() => {
        if (!user) return;
        const hasChanges = 
            formData.name !== (user.name || '') ||
            formData.email !== (user.email || '') ||
            formData.role !== (user.role || '') ||
            formData.company !== (user.company || '') ||
            formData.bio !== (user.bio || '');
        setIsDirty(hasChanges);
    }, [formData, user]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        const result = await updateProfile(formData);
        setLoading(false);
        if (result.success) {
            setIsDirty(false);
            onClose();
        }
    };

    const handleDiscard = () => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                role: user.role || '',
                company: user.company || '',
                bio: user.bio || '',
            });
        }
        setIsDirty(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
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

    if (!isOpen || !user) return null;

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
                aria-labelledby="profile-modal-title"
            >
                {/* Header */}
                <div className="px-4 py-4 sm:px-6 sm:py-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div
                            className="w-12 h-12 sm:w-16 sm:h-16"
                            style={{
                                borderRadius: 'var(--radius-full)',
                                background: 'var(--color-bg-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                fontWeight: 'var(--font-weight-semibold)',
                                color: 'var(--color-text-secondary)',
                                flexShrink: 0,
                            }}
                        >
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h2
                                id="profile-modal-title"
                                className="text-lg sm:text-xl"
                                style={{
                                    fontWeight: 'var(--font-weight-semibold)',
                                    color: 'var(--color-text-primary)',
                                    marginBottom: '4px',
                                }}
                            >
                                {user.name}
                            </h2>
                            <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)', wordBreak: 'break-word' }}>
                                {user.email}
                            </p>
                        </div>
                        <button
                            className="btn-ghost"
                            onClick={onClose}
                            aria-label="Close modal"
                            style={{ padding: '12px', marginTop: '-8px', marginRight: '-8px' }}
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
                            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            Profile
                        </button>
                        <button
                            className={`tab ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            Security
                        </button>
                        <button
                            className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
                            onClick={() => setActiveTab('activity')}
                        >
                            Activity
                        </button>
                        <button
                            className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
                            onClick={() => setActiveTab('preferences')}
                        >
                            Preferences
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                    {activeTab === 'profile' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label
                                    htmlFor="input-name"
                                    style={{
                                        display: 'block',
                                        fontSize: 'var(--font-size-body-sm)',
                                        fontWeight: 'var(--font-weight-medium)',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: '8px',
                                    }}
                                >
                                    Full Name
                                </label>
                                <input
                                    id="input-name"
                                    type="text"
                                    className="input"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="input-email"
                                    style={{
                                        display: 'block',
                                        fontSize: 'var(--font-size-body-sm)',
                                        fontWeight: 'var(--font-weight-medium)',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: '8px',
                                    }}
                                >
                                    Email
                                </label>
                                <input
                                    id="input-email"
                                    type="email"
                                    className="input"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="input-role"
                                    style={{
                                        display: 'block',
                                        fontSize: 'var(--font-size-body-sm)',
                                        fontWeight: 'var(--font-weight-medium)',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: '8px',
                                    }}
                                >
                                    Role
                                </label>
                                <input
                                    id="input-role"
                                    type="text"
                                    className="input"
                                    value={formData.role}
                                    onChange={(e) => handleChange('role', e.target.value)}
                                    placeholder="e.g., Product Manager"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="input-company"
                                    style={{
                                        display: 'block',
                                        fontSize: 'var(--font-size-body-sm)',
                                        fontWeight: 'var(--font-weight-medium)',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: '8px',
                                    }}
                                >
                                    Company
                                </label>
                                <input
                                    id="input-company"
                                    type="text"
                                    className="input"
                                    value={formData.company}
                                    onChange={(e) => handleChange('company', e.target.value)}
                                    placeholder="Your company"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="input-bio"
                                    style={{
                                        display: 'block',
                                        fontSize: 'var(--font-size-body-sm)',
                                        fontWeight: 'var(--font-weight-medium)',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: '8px',
                                    }}
                                >
                                    Bio
                                </label>
                                <textarea
                                    id="input-bio"
                                    className="input textarea"
                                    value={formData.bio}
                                    onChange={(e) => handleChange('bio', e.target.value)}
                                    placeholder="Tell us about yourself"
                                    rows="4"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label
                                    htmlFor="input-current-password"
                                    style={{
                                        display: 'block',
                                        fontSize: 'var(--font-size-body-sm)',
                                        fontWeight: 'var(--font-weight-medium)',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: '8px',
                                    }}
                                >
                                    Current Password
                                </label>
                                <input
                                    id="input-current-password"
                                    type="password"
                                    className="input"
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="input-new-password"
                                    style={{
                                        display: 'block',
                                        fontSize: 'var(--font-size-body-sm)',
                                        fontWeight: 'var(--font-weight-medium)',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: '8px',
                                    }}
                                >
                                    New Password
                                </label>
                                <input
                                    id="input-new-password"
                                    type="password"
                                    className="input"
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="input-confirm-password"
                                    style={{
                                        display: 'block',
                                        fontSize: 'var(--font-size-body-sm)',
                                        fontWeight: 'var(--font-weight-medium)',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: '8px',
                                    }}
                                >
                                    Confirm Password
                                </label>
                                <input
                                    id="input-confirm-password"
                                    type="password"
                                    className="input"
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-muted)' }}>
                                Password changes require re-authentication
                            </p>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div
                                style={{
                                    padding: '16px',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--color-border)',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-primary)' }}>
                                        Last Login
                                    </span>
                                    <span style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-muted)' }}>
                                        {new Date().toLocaleDateString()}
                                    </span>
                                </div>
                                <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                                    Your account is active
                                </p>
                            </div>
                            <div
                                style={{
                                    padding: '16px',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--color-border)',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-primary)' }}>
                                        Sessions Created
                                    </span>
                                    <span style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-muted)' }}>
                                        View in Dashboard
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div
                                style={{
                                    padding: '16px',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--color-border)',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                                            Email Notifications
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                                            Receive updates about your sessions
                                        </div>
                                    </div>
                                    <div className="toggle-switch active" onClick={(e) => e.currentTarget.classList.toggle('active')} />
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: '16px',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--color-border)',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                                            Save Session History
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                                            Keep your analysis sessions saved
                                        </div>
                                    </div>
                                    <div className="toggle-switch active" onClick={(e) => e.currentTarget.classList.toggle('active')} />
                                </div>
                            </div>
                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        fontSize: 'var(--font-size-body-sm)',
                                        fontWeight: 'var(--font-weight-medium)',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: '8px',
                                    }}
                                >
                                    Current Plan
                                </label>
                                <div
                                    style={{
                                        padding: '16px',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--color-border)',
                                    }}
                                >
                                    <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                                        {user.plan || 'Free'}
                                    </div>
                                    <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                                        Your current subscription plan
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {activeTab === 'profile' && (
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
                )}
            </div>
        </div>,
        document.body
    );
}
