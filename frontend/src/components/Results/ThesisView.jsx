import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Target, Lightbulb, Users, Layers, Copy, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '../shared/Toast';
import './ResultsStyles.css';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

function ThesisView({ data }) {
    const { toast } = useToast();
    
    // Debug logging once on mount or data change
    useEffect(() => {
        if (data) {
            console.log('🎯 ThesisView - Data:', data);
            console.log('✨ Core features:', data.core_features);
            console.log('👥 Target users:', data.target_users);
        }
    }, [data]);
    
    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Target className="w-12 h-12 text-(--color-text-muted) mb-4" />
                <p className="text-(--color-text-secondary) text-lg font-medium mb-2">
                    No concept data available
                </p>
                <p className="text-(--color-text-tertiary) text-sm">
                    Generate a startup concept to see refined thesis
                </p>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="results-container"
        >
            {/* Professional Hero Header */}
            <motion.div variants={itemVariants} className="results-hero">
                <motion.div
                    className="results-hero-icon"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                    <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
                
                <h2 className="results-hero-title">
                    Your Startup Thesis
                </h2>
                <p className="results-hero-subtitle">
                    A validated concept ready for execution
                </p>

                <div className="results-hero-actions">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            const text = `PROBLEM:\n${data.problem_summary}\n\nSOLUTION:\n${data.solution_summary}\n\nTARGET USERS:\n${data.target_users?.join(', ')}\n\nMVP FEATURES:\n${data.core_features?.map((f, i) => `${i + 1}. ${f}`).join('\n')}`;
                            navigator.clipboard.writeText(text);
                            toast.success('Concept thesis copied to clipboard!');
                        }}
                        className="results-btn results-btn-primary"
                        aria-label="Copy concept thesis to clipboard"
                    >
                        <Copy className="w-5 h-5" />
                        <span>Copy All</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            const text = `PROBLEM:\n${data.problem_summary}\n\nSOLUTION:\n${data.solution_summary}\n\nTARGET USERS:\n${data.target_users?.join(', ')}\n\nMVP FEATURES:\n${data.core_features?.map((f, i) => `${i + 1}. ${f}`).join('\n')}`;
                            const blob = new Blob([text], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'concept-thesis.txt';
                            a.click();
                            URL.revokeObjectURL(url);
                            toast.success('Concept thesis exported!');
                        }}
                        className="results-btn results-btn-secondary"
                        aria-label="Export concept thesis as text file"
                    >
                        <Download className="w-5 h-5" />
                        <span>Export</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* Problem & Solution - Modern Cards */}
            <div className="results-content-grid" style={{ marginBottom: 'var(--space-8)' }}>
                <motion.div variants={itemVariants} className="results-card">
                    <span className="results-card-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'rgb(239, 68, 68)' }}>
                        <Target className="w-4 h-4" />
                        Challenge
                    </span>
                    <h3 className="results-card-title">The Problem</h3>
                    <p className="results-card-content">
                        {data.problem_summary}
                    </p>
                </motion.div>

                <motion.div variants={itemVariants} className="results-card">
                    <span className="results-card-badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'rgb(34, 197, 94)' }}>
                        <Lightbulb className="w-4 h-4" />
                        Innovation
                    </span>
                    <h3 className="results-card-title">The Solution</h3>
                    <p className="results-card-content">
                        {data.solution_summary}
                    </p>
                </motion.div>
            </div>

            {/* Target Audience - Professional Cards */}
            <motion.div variants={itemVariants} className="results-section">
                <div className="results-section-header">
                    <div className="results-section-icon">
                        <Users />
                    </div>
                    <div>
                        <h3 className="results-section-title">Target Audience</h3>
                        <p className="results-section-subtitle">Who will benefit most from your solution</p>
                    </div>
                </div>
                
                {data.target_users && data.target_users.length > 0 ? (
                <div className="results-content-grid columns-3">
                    {data.target_users.map((user, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="results-card"
                            style={{ padding: 'var(--space-5)', cursor: 'default' }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div 
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'var(--gradient-primary)',
                                    color: 'white',
                                    borderRadius: '50%',
                                    fontSize: 'var(--font-size-h4)',
                                    fontWeight: '700',
                                    marginBottom: 'var(--space-4)',
                                    boxShadow: '0 4px 16px rgba(0, 210, 255, 0.3)'
                                }}
                            >
                                {index + 1}
                            </div>
                            <p style={{ 
                                fontSize: 'var(--font-size-body)',
                                color: 'var(--color-text-primary)',
                                lineHeight: '1.6',
                                fontWeight: '500'
                            }}>
                                {user}
                            </p>
                        </motion.div>
                    ))}
                </div>
                ) : (
                    <div className="results-card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                        <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                        <p style={{ 
                            color: 'var(--color-text-secondary)', 
                            fontSize: 'var(--font-size-body)',
                            marginBottom: 'var(--space-2)'
                        }}>
                            No target users defined yet
                        </p>
                        <p style={{ 
                            color: 'var(--color-text-muted)', 
                            fontSize: 'var(--font-size-body-sm)'
                        }}>
                            The AI didn't populate this section. Try regenerating the concept.
                        </p>
                    </div>
                )}
            </motion.div>

            {/* MVP Core Features - Interactive List */}
            <motion.div variants={itemVariants} className="results-section">
                <div className="results-section-header">
                    <div className="results-section-icon">
                        <Layers />
                    </div>
                    <div>
                        <h3 className="results-section-title">MVP Core Features</h3>
                        <p className="results-section-subtitle">Essential features for your minimum viable product</p>
                    </div>
                </div>
                
                {data.core_features && data.core_features.length > 0 ? (
                <div className="results-content-grid">
                    {data.core_features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            whileHover={{ x: 4 }}
                            className="results-card"
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 'var(--space-4)',
                                padding: 'var(--space-5)',
                                cursor: 'default'
                            }}
                        >
                            <div 
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'var(--gradient-primary)',
                                    color: 'white',
                                    borderRadius: 'var(--radius-lg)',
                                    fontSize: 'var(--font-size-body-sm)',
                                    fontWeight: '700'
                                }}
                            >
                                {index + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{
                                    fontSize: 'var(--font-size-body)',
                                    color: 'var(--color-text-primary)',
                                    lineHeight: '1.6',
                                    fontWeight: '500',
                                    margin: 0
                                }}>
                                    {feature}
                                </p>
                            </div>
                            <CheckCircle2 
                                className="w-5 h-5" 
                                style={{
                                    flexShrink: 0,
                                    color: 'var(--color-success)',
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                            />
                        </motion.div>
                    ))}
                </div>
                ) : (
                    <div className="results-card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                        <Layers className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                        <p style={{ 
                            color: 'var(--color-text-secondary)', 
                            fontSize: 'var(--font-size-body)',
                            marginBottom: 'var(--space-2)'
                        }}>
                            No MVP features generated yet
                        </p>
                        <p style={{ 
                            color: 'var(--color-text-muted)', 
                            fontSize: 'var(--font-size-body-sm)'
                        }}>
                            The AI didn't populate this section. Try regenerating the concept.
                        </p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

export default ThesisView;
