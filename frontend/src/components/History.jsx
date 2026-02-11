import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    History as HistoryIcon, Clock, Trash2, Eye, Search, Filter,
    CheckCircle2, AlertCircle, Loader2, Sparkles, Calendar
} from 'lucide-react';
import { sessionApi } from '../services/api';
import { useToast } from './shared/Toast';

function History() {
    const navigate = useNavigate();
    const { toast } = useToast();
    
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, completed, processing, failed
    const [deletingId, setDeletingId] = useState(null);
    
    useEffect(() => {
        fetchSessions();
    }, []);
    
    const fetchSessions = async () => {
        try {
            setLoading(true);
            const data = await sessionApi.getUserSessions();
            // Backend transforms _id to id, so normalize to _id for consistency
            const normalizedSessions = (data.sessions || []).map(session => ({
                ...session,
                _id: session._id || session.id
            }));
            setSessions(normalizedSessions);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
            toast.error('Failed to load session history');
        } finally {
            setLoading(false);
        }
    };
    
    const handleViewSession = async (sessionId) => {
        if (!sessionId) {
            toast.error('Invalid session ID');
            return;
        }
        try {
            const data = await sessionApi.get(sessionId);
            // Navigate to dashboard with session data
            navigate('/dashboard', { state: { session: data.session } });
        } catch (error) {
            console.error('Failed to load session:', error);
            toast.error('Failed to load session');
        }
    };
    
    const handleDeleteSession = async (sessionId) => {
        if (!window.confirm('Are you sure you want to delete this session? This cannot be undone.')) {
            return;
        }
        
        try {
            setDeletingId(sessionId);
            await sessionApi.delete(sessionId);
            setSessions(sessions.filter(s => s._id !== sessionId));
            toast.success('Session deleted successfully');
        } catch (error) {
            console.error('Failed to delete session:', error);
            toast.error('Failed to delete session');
        } finally {
            setDeletingId(null);
        }
    };
    
    // Filter sessions - only show sessions with valid _id
    const filteredSessions = sessions.filter(session => {
        if (!session || !session._id) return false;
        // If no search term, match all; otherwise check if ideaText/idea_text includes the search term
        const ideaContent = session.ideaText || session.idea_text || '';
        const matchesSearch = !searchTerm || ideaContent.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || session.status === filterStatus;
        return matchesSearch && matchesFilter;
    });
    
    // Status styling
    const getStatusConfig = (status) => {
        switch (status) {
            case 'completed':
                return { 
                    icon: CheckCircle2, 
                    color: 'var(--color-success)', 
                    bg: 'var(--color-success-bg)', 
                    label: 'Completed' 
                };
            case 'processing':
                return { 
                    icon: Loader2, 
                    color: 'var(--color-info)', 
                    bg: 'var(--color-info-bg)', 
                    label: 'Processing', 
                    spin: true 
                };
            case 'failed':
                return { 
                    icon: AlertCircle, 
                    color: 'var(--color-error)', 
                    bg: 'var(--color-error-bg)', 
                    label: 'Failed' 
                };
            case 'partial':
                return { 
                    icon: AlertCircle, 
                    color: 'var(--color-warning)', 
                    bg: 'var(--color-warning-bg)', 
                    label: 'Partial' 
                };
            default:
                return { 
                    icon: Clock, 
                    color: 'var(--color-text-muted)', 
                    bg: 'var(--color-bg-tertiary)', 
                    label: 'Created' 
                };
        }
    };
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    return (
        <div 
            className="min-h-screen"
            style={{ 
                backgroundColor: 'var(--color-bg-secondary)',
                paddingTop: 'var(--space-6)',
                paddingBottom: 'var(--space-8)',
                paddingLeft: 'var(--space-6)',
                paddingRight: 'var(--space-6)'
            }}
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ marginBottom: 'var(--space-8)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--gradient-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'var(--shadow-md)'
                        }}>
                            <HistoryIcon className="w-5 h-5" style={{ color: 'white' }} />
                        </div>
                        <h1 
                            style={{ 
                                fontSize: 'var(--font-size-h1)',
                                fontWeight: 'var(--font-weight-bold)',
                                color: 'var(--color-text-primary)',
                                margin: 0
                            }}
                        >
                            Session History
                        </h1>
                    </div>
                    <p style={{ 
                        color: 'var(--color-text-muted)',
                        fontSize: 'var(--font-size-body)',
                        marginLeft: '52px'
                    }}>
                        Your previous startup idea generations
                    </p>
                </motion.div>
                
                {/* Filters & Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-4)',
                        marginBottom: 'var(--space-8)'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-4)'
                    }}>
                        {/* Search Bar */}
                        <div style={{ 
                            position: 'relative', 
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 'var(--space-3)'
                        }}>
                            <div style={{ 
                                position: 'relative', 
                                width: '100%',
                                maxWidth: '600px'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    left: 'var(--space-4)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--color-bg-secondary)',
                                    pointerEvents: 'none'
                                }}>
                                    <Search style={{ 
                                        width: '20px',
                                        height: '20px',
                                        color: 'var(--color-text-muted)'
                                    }} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search your ideas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--space-4) var(--space-5) var(--space-4) 72px',
                                        fontSize: 'var(--font-size-body)',
                                        fontWeight: 'var(--font-weight-medium)',
                                        backgroundColor: 'var(--color-bg-card)',
                                        border: '2px solid var(--color-border)',
                                        borderRadius: 'var(--radius-xl)',
                                        color: 'var(--color-text-primary)',
                                        outline: 'none',
                                        transition: 'all var(--transition-base)',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'var(--color-primary)';
                                        e.target.style.boxShadow = 'var(--shadow-md)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'var(--color-border)';
                                        e.target.style.boxShadow = 'var(--shadow-sm)';
                                    }}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        style={{
                                            position: 'absolute',
                                            right: 'var(--space-4)',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: 'var(--radius-full)',
                                            background: 'var(--color-bg-tertiary)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--color-text-secondary)',
                                            transition: 'all var(--transition-base)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--color-bg-hover)';
                                            e.currentTarget.style.color = 'var(--color-text-primary)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                                            e.currentTarget.style.color = 'var(--color-text-secondary)';
                                        }}
                                        aria-label="Clear search"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <path d="M12 4L4 12M4 4l8 8" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {/* Filter Tabs */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                            <span style={{ 
                                fontSize: 'var(--font-size-body-sm)',
                                fontWeight: 'var(--font-weight-medium)',
                                color: 'var(--color-text-secondary)'
                            }}>
                                Filter by:
                            </span>
                            <div className="tab-list" style={{ padding: 'var(--space-1)', gap: 'var(--space-1)' }}>
                                {[
                                    { value: 'all', label: 'All', count: sessions.length },
                                    { value: 'completed', label: 'Completed', count: sessions.filter(s => s.status === 'completed').length },
                                    { value: 'processing', label: 'Processing', count: sessions.filter(s => s.status === 'processing').length },
                                    { value: 'failed', label: 'Failed', count: sessions.filter(s => s.status === 'failed').length }
                                ].map((filter) => (
                                    <button
                                        key={filter.value}
                                        onClick={() => setFilterStatus(filter.value)}
                                        className={`tab ${filterStatus === filter.value ? 'active' : ''}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-2)',
                                            padding: 'var(--space-2) var(--space-4)',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        <span>{filter.label}</span>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            minWidth: '20px',
                                            height: '20px',
                                            padding: '0 var(--space-1)',
                                            fontSize: 'var(--font-size-xs)',
                                            fontWeight: 'var(--font-weight-semibold)',
                                            borderRadius: 'var(--radius-full)',
                                            backgroundColor: filterStatus === filter.value ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                                            color: filterStatus === filter.value ? 'white' : 'var(--color-text-muted)'
                                        }}>
                                            {filter.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
                
                {/* Sessions Grid */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--space-20) 0' }}>
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
                    </div>
                ) : filteredSessions.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: 'center', padding: 'var(--space-20) 0' }}
                    >
                        <div style={{
                            width: '64px',
                            height: '64px',
                            margin: '0 auto var(--space-4)',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--color-bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <HistoryIcon className="w-8 h-8" style={{ color: 'var(--color-text-muted)' }} />
                        </div>
                        <h3 style={{ 
                            fontSize: 'var(--font-size-h3)',
                            fontWeight: 'var(--font-weight-semibold)',
                            color: 'var(--color-text-primary)',
                            marginBottom: 'var(--space-2)'
                        }}>
                            {searchTerm || filterStatus !== 'all' ? 'No matching sessions' : 'No history yet'}
                        </h3>
                        <p style={{ 
                            color: 'var(--color-text-muted)',
                            marginBottom: 'var(--space-6)'
                        }}>
                            {searchTerm || filterStatus !== 'all' 
                                ? 'Try adjusting your filters' 
                                : 'Start by generating your first startup idea'}
                        </p>
                        {!searchTerm && filterStatus === 'all' && (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="btn-primary"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-2)',
                                    padding: 'var(--space-3) var(--space-6)'
                                }}
                            >
                                <Sparkles className="w-5 h-5" />
                                <span>Generate Your First Idea</span>
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: 'var(--space-6)'
                    }}>
                        <AnimatePresence>
                            {filteredSessions.map((session, index) => {
                                const statusConfig = getStatusConfig(session.status);
                                const StatusIcon = statusConfig.icon;
                                
                                return (
                                    <motion.div
                                        key={session._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="card"
                                        style={{
                                            padding: 'var(--space-6)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 'var(--space-4)',
                                            cursor: 'pointer',
                                            transition: 'var(--transition-base)',
                                            border: '2px solid var(--color-border)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--color-border)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                        onClick={() => handleViewSession(session._id)}
                                    >
                                        {/* Header with Status */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span 
                                                style={{ 
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 'var(--space-2)',
                                                    padding: 'var(--space-2) var(--space-3)',
                                                    borderRadius: 'var(--radius-full)',
                                                    fontSize: 'var(--font-size-body-sm)',
                                                    fontWeight: 'var(--font-weight-medium)',
                                                    backgroundColor: statusConfig.bg,
                                                    color: statusConfig.color
                                                }}
                                            >
                                                <StatusIcon 
                                                    className={statusConfig.spin ? 'animate-spin' : ''} 
                                                    style={{ width: '16px', height: '16px' }} 
                                                />
                                                <span>{statusConfig.label}</span>
                                            </span>
                                        </div>
                                        
                                        {/* Idea Text */}
                                        <h3 
                                            style={{ 
                                                fontSize: 'var(--font-size-h4)',
                                                fontWeight: 'var(--font-weight-semibold)',
                                                color: 'var(--color-text-primary)',
                                                lineHeight: '1.5',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                margin: 0,
                                                minHeight: '72px'
                                            }}
                                        >
                                            {session.ideaText || session.idea_text || 'Untitled Session'}
                                        </h3>
                                        
                                        {/* Meta Info */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                            {session.domainHint && (
                                                <span 
                                                    style={{ 
                                                        padding: 'var(--space-1) var(--space-3)',
                                                        borderRadius: 'var(--radius-md)',
                                                        fontSize: 'var(--font-size-xs)',
                                                        fontWeight: 'var(--font-weight-medium)',
                                                        backgroundColor: 'var(--color-bg-secondary)',
                                                        color: 'var(--color-text-secondary)',
                                                        border: '1px solid var(--color-border)'
                                                    }}
                                                >
                                                    {session.domainHint}
                                                </span>
                                            )}
                                            {session.tonePreference && (
                                                <span 
                                                    style={{ 
                                                        padding: 'var(--space-1) var(--space-3)',
                                                        borderRadius: 'var(--radius-md)',
                                                        fontSize: 'var(--font-size-xs)',
                                                        fontWeight: 'var(--font-weight-medium)',
                                                        backgroundColor: 'var(--color-bg-secondary)',
                                                        color: 'var(--color-text-secondary)',
                                                        border: '1px solid var(--color-border)'
                                                    }}
                                                >
                                                    {session.tonePreference}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Date */}
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 'var(--space-2)',
                                            color: 'var(--color-text-muted)',
                                            fontSize: 'var(--font-size-body-sm)'
                                        }}>
                                            <Calendar style={{ width: '16px', height: '16px' }} />
                                            <span>{formatDate(session.createdAt)}</span>
                                        </div>
                                        
                                        {/* Actions */}
                                        <div style={{ 
                                            display: 'flex', 
                                            gap: 'var(--space-2)',
                                            marginTop: 'auto',
                                            paddingTop: 'var(--space-2)'
                                        }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewSession(session._id);
                                                }}
                                                className="btn-primary"
                                                style={{
                                                    flex: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 'var(--space-2)',
                                                    padding: 'var(--space-3) var(--space-4)',
                                                    borderRadius: 'var(--radius-lg)'
                                                }}
                                            >
                                                <Eye style={{ width: '18px', height: '18px' }} />
                                                <span>View</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteSession(session._id);
                                                }}
                                                disabled={deletingId === session._id}
                                                className="btn-ghost"
                                                style={{
                                                    padding: 'var(--space-3)',
                                                    color: 'var(--color-text-secondary)',
                                                    border: '2px solid var(--color-border)',
                                                    borderRadius: 'var(--radius-lg)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (deletingId !== session._id) {
                                                        e.currentTarget.style.borderColor = 'var(--color-error)';
                                                        e.currentTarget.style.color = 'var(--color-error)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (deletingId !== session._id) {
                                                        e.currentTarget.style.borderColor = 'var(--color-border)';
                                                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                                                    }
                                                }}
                                            >
                                                {deletingId === session._id ? (
                                                    <Loader2 style={{ width: '18px', height: '18px' }} className="animate-spin" />
                                                ) : (
                                                    <Trash2 style={{ width: '18px', height: '18px' }} />
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}

export default History;
