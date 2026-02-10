import { motion } from 'framer-motion';
import { User, Mail, Calendar, Award, Edit2, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './shared/Toast';

function Profile() {
    const navigate = useNavigate();
    const { user, updateProfile } = useAuth();
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: '',
        company: '',
        role: '',
        joinDate: '',
    });

    // Load user data from context
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || 'Demo User',
                email: user.email || 'demo@startup.ai',
                bio: user.bio || 'Passionate entrepreneur building the next big thing',
                company: user.company || 'Startup Simulator AI',
                role: user.role || 'Product Manager',
                joinDate: user.joinDate || 'January 2024',
            });
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateProfile(formData);
        setIsSaving(false);

        if (result.success) {
            setIsEditing(false);
            showToast('Profile updated successfully!', 'success');
        } else {
            showToast(result.error || 'Failed to update profile', 'error');
        }
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
                        Profile
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

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-8"
                    style={{
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        boxShadow: 'var(--shadow-lg)',
                    }}
                >
                    {/* Avatar Section */}
                    <div className="flex items-start gap-6 mb-8">
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center shrink-0"
                            style={{
                                background: 'var(--gradient-primary)',
                                color: 'white',
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                boxShadow: 'var(--shadow-md)',
                            }}
                        >
                            {formData.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h2
                                className="text-xl font-bold mb-1"
                                style={{ color: 'var(--color-text-primary)' }}
                            >
                                {formData.name}
                            </h2>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                {formData.email}
                            </p>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md"
                                style={{
                                    background: 'var(--color-bg-hover)',
                                    fontSize: 'var(--font-size-body-sm)',
                                    color: 'var(--color-text-muted)',
                                }}
                            >
                                <Award style={{ width: '16px', height: '16px' }} />
                                <span>{user?.plan || 'Free'} Plan</span>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-4 py-2 rounded-lg flex items-center gap-2"
                            style={{
                                background: isEditing ? 'var(--color-error)' : 'var(--color-primary)',
                                color: 'white',
                            }}
                        >
                            {isEditing ? (
                                <>
                                    <X style={{ width: '18px', height: '18px' }} />
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <Edit2 style={{ width: '18px', height: '18px' }} />
                                    Edit
                                </>
                            )}
                        </motion.button>
                    </div>

                    {/* Divider */}
                    <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '2rem' }} />

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoField
                            icon={User}
                            label="Full Name"
                            value={formData.name}
                            isEditing={isEditing}
                            onChange={(val) => setFormData({ ...formData, name: val })}
                        />
                        <InfoField
                            icon={Mail}
                            label="Email"
                            value={formData.email}
                            isEditing={isEditing}
                            onChange={(val) => setFormData({ ...formData, email: val })}
                        />
                        <InfoField
                            icon={User}
                            label="Role"
                            value={formData.role}
                            isEditing={isEditing}
                            onChange={(val) => setFormData({ ...formData, role: val })}
                        />
                        <InfoField
                            icon={User}
                            label="Company"
                            value={formData.company}
                            isEditing={isEditing}
                            onChange={(val) => setFormData({ ...formData, company: val })}
                        />
                        <div className="md:col-span-2">
                            <InfoField
                                icon={User}
                                label="Bio"
                                value={formData.bio}
                                isEditing={isEditing}
                                onChange={(val) => setFormData({ ...formData, bio: val })}
                                multiline
                            />
                        </div>
                        <InfoField
                            icon={Calendar}
                            label="Member Since"
                            value={formData.joinDate}
                            isEditing={false}
                        />
                    </div>

                    {/* Save Button */}
                    {isEditing && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 pt-6"
                            style={{ borderTop: '1px solid var(--color-border)' }}
                        >
                            <motion.button
                                whileHover={{ scale: isSaving ? 1 : 1.02 }}
                                whileTap={{ scale: isSaving ? 1 : 0.98 }}
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold"
                                style={{
                                    background: isSaving ? 'var(--color-bg-secondary)' : 'var(--gradient-primary)',
                                    color: 'white',
                                    opacity: isSaving ? 0.7 : 1,
                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                }}
                            >
                                <Save style={{ width: '18px', height: '18px' }} />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </motion.button>
                        </motion.div>
                    )}
                </motion.div>

                {/* Account Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
                >
                    <StatCard title="Projects Created" value="12" />
                    <StatCard title="Ideas Generated" value="48" />
                    <StatCard title="Success Rate" value="85%" />
                </motion.div>
            </div>
        </div>
    );
}

// Info Field Component
function InfoField({ icon: Icon, label, value, isEditing, onChange, multiline = false }) {
    return (
        <div>
            <label
                className="flex items-center gap-2 mb-2 font-medium"
                style={{
                    fontSize: 'var(--font-size-body-sm)',
                    color: 'var(--color-text-secondary)',
                }}
            >
                <Icon style={{ width: '16px', height: '16px' }} />
                {label}
            </label>
            {isEditing ? (
                multiline ? (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full p-3 rounded-lg"
                        style={{
                            background: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                            fontSize: 'var(--font-size-body-sm)',
                            minHeight: '100px',
                            resize: 'vertical',
                        }}
                    />
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full p-3 rounded-lg"
                        style={{
                            background: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                            fontSize: 'var(--font-size-body-sm)',
                        }}
                    />
                )
            ) : (
                <p
                    className="p-3 rounded-lg"
                    style={{
                        background: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)',
                        fontSize: 'var(--font-size-body-sm)',
                        minHeight: multiline ? '100px' : 'auto',
                    }}
                >
                    {value}
                </p>
            )}
        </div>
    );
}

// Stat Card Component
function StatCard({ title, value }) {
    return (
        <div
            className="p-4 rounded-lg text-center"
            style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
            }}
        >
            <p
                className="text-2xl font-bold mb-1"
                style={{
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
            >
                {value}
            </p>
            <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-muted)' }}>
                {title}
            </p>
        </div>
    );
}

export default Profile;
