import { motion } from 'framer-motion';
import { DollarSign, PieChart, Users, Share2, RefreshCw, Download, TrendingUp, Package } from 'lucide-react';
import { useState } from 'react';
import { sessionApi } from '../../services/api';
import { useToast } from '../shared/Toast';
import './ResultsStyles.css';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

function BusinessModelView({ data: initialData, sessionId, onRegenerate }) {
    const [data, setData] = useState(initialData);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const { toast } = useToast();

    if (!data) return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <DollarSign className="w-12 h-12 text-(--color-text-muted) mb-4" />
            <p className="text-(--color-text-secondary) text-lg font-medium mb-2">
                No business model available
            </p>
            <p className="text-(--color-text-tertiary) text-sm">
                Generate a startup concept to see business model
            </p>
        </div>
    );

    const handleRegenerate = async () => {
        setIsRegenerating(true);
        try {
            const result = await sessionApi.regenerate(sessionId, 'business_model');
            setData(result.data);
            if (onRegenerate) onRegenerate(result.data);
            toast.success('Business model regenerated!');
        } catch (error) {
            console.error('Failed to regenerate:', error);
            toast.error('Failed to regenerate');
        } finally {
            setIsRegenerating(false);
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="results-container"
        >
            {/* Hero Header */}
            <motion.div variants={itemVariants} className="results-hero">
                <motion.div
                    className="results-hero-icon"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                    <DollarSign className="w-10 h-10 text-white" />
                </motion.div>

                <h1 className="results-hero-title">
                    Business Model
                </h1>

                <p className="results-hero-subtitle">
                    Revenue streams, costs, and operational strategy
                </p>

                <div className="results-hero-actions">
                    <button
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="results-btn results-btn-primary"
                    >
                        <RefreshCw className={`h-5 w-5 ${isRegenerating ? 'animate-spin' : ''}`} />
                        <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
                    </button>

                    <button
                        onClick={() => {
                            const text = `REVENUE STREAMS:\n${data.revenue_streams?.map(s => `- ${s.name} (${s.pricing_model}): ${s.description}`).join('\n')}\n\nCOST STRUCTURE:\n${data.cost_structure?.map(c => `- ${c.name} (${c.type}): ${c.description}`).join('\n')}`;
                            const blob = new Blob([text], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'business-model.txt';
                            a.click();
                            URL.revokeObjectURL(url);
                            toast.success('Exported!');
                        }}
                        className="results-btn results-btn-secondary"
                    >
                        <Download className="h-5 w-5" />
                        <span>Export</span>
                    </button>
                </div>
            </motion.div>

            <div className="business-model-grid">
                {/* Revenue Streams */}
                <motion.div variants={itemVariants} className="results-section">
                    <div className="results-section-header">
                        <div className="results-section-icon">
                            <TrendingUp />
                        </div>
                        <div>
                            <h2 className="results-section-title">Revenue Streams</h2>
                            <p className="results-section-subtitle">How you make money</p>
                        </div>
                    </div>
                    <div className="revenue-streams-list">
                        {data.revenue_streams?.map((stream, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                className="revenue-stream-card"
                            >
                                <div className="revenue-stream-header">
                                    <h4 className="revenue-stream-name">{stream.name}</h4>
                                    <span className="revenue-stream-badge">{stream.pricing_model}</span>
                                </div>
                                <p className="revenue-stream-text">{stream.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Cost Structure */}
                <motion.div variants={itemVariants} className="results-section">
                    <div className="results-section-header">
                        <div className="results-section-icon">
                            <PieChart />
                        </div>
                        <div>
                            <h2 className="results-section-title">Cost Structure</h2>
                            <p className="results-section-subtitle">Where money goes</p>
                        </div>
                    </div>
                    <div className="cost-structure-list">
                        {data.cost_structure?.map((cost, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                className="cost-structure-card"
                            >
                                <div className={`cost-type-indicator ${cost.type.toLowerCase()}`} />
                                <div className="cost-structure-content">
                                    <div className="cost-structure-header">
                                        <h4 className="cost-structure-name">{cost.name}</h4>
                                        <span className="cost-structure-badge">{cost.type}</span>
                                    </div>
                                    <p className="cost-structure-text">{cost.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Key Partnerships */}
                {data.key_partnerships && (
                    <motion.div variants={itemVariants} className="results-section">
                        <div className="results-section-header">
                            <div className="results-section-icon">
                                <Users />
                            </div>
                            <div>
                                <h2 className="results-section-title">Key Partnerships</h2>
                                <p className="results-section-subtitle">Strategic collaborations</p>
                            </div>
                        </div>
                        <div className="partnerships-list">
                            {data.key_partnerships.map((partnership, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 * idx }}
                                    className="partnership-card"
                                >
                                    <h4 className="partnership-name">{partnership.partner}</h4>
                                    <p className="partnership-text">{partnership.rationale}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Channels */}
                {data.channels && (
                    <motion.div variants={itemVariants} className="results-section">
                        <div className="results-section-header">
                            <div className="results-section-icon">
                                <Share2 />
                            </div>
                            <div>
                                <h2 className="results-section-title">Distribution Channels</h2>
                                <p className="results-section-subtitle">How you reach customers</p>
                            </div>
                        </div>
                        <div className="channels-list">
                            {data.channels.map((ch, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 * idx }}
                                    className="channel-card"
                                >
                                    <h4 className="channel-name">{ch.channel}</h4>
                                    <p className="channel-text">{ch.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

export default BusinessModelView;
