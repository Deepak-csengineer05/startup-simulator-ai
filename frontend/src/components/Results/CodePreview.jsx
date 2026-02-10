import { motion } from 'framer-motion';
import { Code, Server, Database, Cloud, Clock, Layers, Copy, Check, RefreshCw, Download } from 'lucide-react';
import { useState } from 'react';
import sessionApi from '../../services/api';
import './ResultsStyles.css';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

function CodePreview({ data }) {
    const [copiedCode, setCopiedCode] = useState(null);

    const handleRegenerate = async () => {
        try {
            await sessionApi.regenerateSection('code_preview');
            window.location.reload();
        } catch (error) {
            console.error('Failed to regenerate:', error);
        }
    };

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Code className="w-12 h-12 text-(--color-text-muted) mb-4" />
                <p className="text-(--color-text-secondary) text-lg font-medium mb-2">
                    No code preview available
                </p>
                <p className="text-(--color-text-tertiary) text-sm">
                    Generate a startup concept to see technical blueprint
                </p>
            </div>
        );
    }

    const copyToClipboard = async (code, index) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(index);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const stackIcons = {
        frontend: Code,
        backend: Server,
        database: Database,
        hosting: Cloud
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="results-container"
        >
            {/* Hero */}
            <motion.div variants={itemVariants} className="results-hero">
                <motion.div
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="results-icon"
                >
                    <Code size={48} />
                </motion.div>
                <h1 className="results-title">Technical Blueprint</h1>
                <p className="results-subtitle">Recommended tech stack, architecture, and implementation</p>
                <div className="results-actions">
                    <button onClick={handleRegenerate} className="results-btn results-btn-primary">
                        <RefreshCw size={18} />
                        Regenerate
                    </button>
                </div>
            </motion.div>

            {/* Tech Stack */}
            {data.tech_stack && (
                <motion.div variants={itemVariants} className="results-section">
                    <div className="results-section-header">
                        <div className="results-section-icon" style={{ background: 'rgba(0, 210, 255, 0.2)' }}>
                            <Layers size={24} style={{ color: '#00D2FF' }} />
                        </div>
                        <div>
                            <h2 className="results-section-title">Recommended Tech Stack</h2>
                            <p className="results-section-subtitle">Best tools and frameworks for your MVP</p>
                        </div>
                    </div>

                    <div className="mvp-stack-grid">
                        {['frontend', 'backend', 'database', 'hosting'].map((key) => {
                            const item = data.tech_stack[key];
                            if (!item) return null;
                            const Icon = { frontend: Code, backend: Server, database: Database, hosting: Cloud }[key];

                            return (
                                <motion.div
                                    key={key}
                                    className="mvp-stack-card"
                                    whileHover={{ y: -3 }}
                                >
                                    <div className="mvp-stack-icon" style={{ background: `rgba(${key === 'frontend' ? '0, 210, 255' : key === 'backend' ? '142, 45, 226' : key === 'database' ? '34, 197, 94' : '251, 191, 36'}, 0.2)` }}>
                                        <Icon size={20} style={{ color: key === 'frontend' ? '#00D2FF' : key === 'backend' ? 'rgb(142, 45, 226)' : key === 'database' ? 'rgb(34, 197, 94)' : 'rgb(251, 191, 36)' }} />
                                    </div>
                                    <div className="mvp-stack-label">{key}</div>
                                    <h4 className="mvp-stack-name">
                                        {item.framework || item.type || item.platform}
                                    </h4>
                                    {item.reasoning && (
                                        <p className="mvp-stack-reasoning">
                                            {item.reasoning}
                                        </p>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Additional Tools */}
                    {data.tech_stack.additional && data.tech_stack.additional.length > 0 && (
                        <div className="mvp-additional-tools">
                            <span className="mvp-additional-label">Additional Tools:</span>
                            <div className="mvp-tools-list">
                                {data.tech_stack.additional.map((tool, i) => (
                                    <span key={i} className="mvp-tool-badge">{tool}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Architecture */}
            {data.architecture && (
                <motion.div variants={itemVariants} className="results-section">
                    <div className="results-section-header">
                        <div className="results-section-icon" style={{ background: 'rgba(142, 45, 226, 0.2)' }}>
                            <Server size={24} style={{ color: 'rgb(142, 45, 226)' }} />
                        </div>
                        <div>
                            <h2 className="results-section-title">System Architecture</h2>
                            <p className="results-section-subtitle">How components work together</p>
                        </div>
                    </div>

                    {data.architecture.description && (
                        <p className="mvp-arch-description">{data.architecture.description}</p>
                    )}

                    {data.architecture.components && (
                        <div className="mvp-components-grid">
                            {data.architecture.components.map((comp, i) => (
                                <div key={i} className="mvp-component-card">
                                    <div className="mvp-component-icon">
                                        <Layers size={20} />
                                    </div>
                                    <h4 className="mvp-component-name">{comp.name}</h4>
                                    <p className="mvp-component-purpose">{comp.purpose}</p>
                                    {comp.tech && (
                                        <span className="mvp-component-tech">{comp.tech}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {data.architecture.diagram_description && (
                        <div className="mvp-diagram">
                            {data.architecture.diagram_description}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Code Samples */}
            {data.code_samples && data.code_samples.length > 0 && (
                <motion.div variants={itemVariants} className="results-section">
                    <div className="results-section-header">
                        <div className="results-section-icon" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
                            <Code size={24} style={{ color: 'rgb(34, 197, 94)' }} />
                        </div>
                        <div>
                            <h2 className="results-section-title">Code Samples</h2>
                            <p className="results-section-subtitle">Example implementations to get started</p>
                        </div>
                    </div>

                    <div className="mvp-code-samples">
                        {data.code_samples.map((sample, index) => (
                            <div key={index} className="mvp-code-block">
                                <div className="mvp-code-header">
                                    <div className="mvp-code-title-group">
                                        <span className="mvp-code-language">
                                            {sample.language || 'code'}
                                        </span>
                                        <span className="mvp-code-title">{sample.title}</span>
                                    </div>
                                    <motion.button
                                        onClick={() => {
                                            navigator.clipboard.writeText(sample.code);
                                            setCopiedCode(index);
                                            setTimeout(() => setCopiedCode(null), 2000);
                                        }}
                                        className="mvp-copy-btn"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {copiedCode === index ? (
                                            <><Check size={16} /> Copied</>
                                        ) : (
                                            <><Copy size={16} /> Copy</>
                                        )}
                                    </motion.button>
                                </div>
                                {sample.description && (
                                    <p className="mvp-code-description">{sample.description}</p>
                                )}
                                <pre className="mvp-code-content">
                                    <code>{sample.code}</code>
                                </pre>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Development Timeline */}
            {data.timeline && (
                <motion.div variants={itemVariants} className="results-section">
                    <div className="results-section-header">
                        <div className="results-section-icon" style={{ background: 'rgba(251, 191, 36, 0.2)' }}>
                            <Clock size={24} style={{ color: 'rgb(251, 191, 36)' }} />
                        </div>
                        <div className="mvp-timeline-header-group">
                            <div>
                                <h2 className="results-section-title">Development Timeline</h2>
                                <p className="results-section-subtitle">Estimated phases and deliverables</p>
                            </div>
                            {data.timeline.total_weeks && (
                                <span className="mvp-timeline-badge">
                                    ~{data.timeline.total_weeks} weeks total
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mvp-timeline">
                        {data.timeline.phases?.map((phase, index) => (
                            <motion.div
                                key={index}
                                className="mvp-timeline-phase"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="mvp-timeline-indicator">
                                    <div className="mvp-timeline-number">{index + 1}</div>
                                    {index < data.timeline.phases.length - 1 && (
                                        <div className="mvp-timeline-line" />
                                    )}
                                </div>
                                <div className="mvp-timeline-content">
                                    <div className="mvp-phase-header">
                                        <h4 className="mvp-phase-name">{phase.phase}</h4>
                                        <span className="mvp-phase-badge">Weeks {phase.weeks}</span>
                                    </div>
                                    <ul className="mvp-deliverables-list">
                                        {phase.deliverables?.map((item, i) => (
                                            <li key={i} className="mvp-deliverable-item">
                                                <div className="mvp-deliverable-dot" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

export default CodePreview;
