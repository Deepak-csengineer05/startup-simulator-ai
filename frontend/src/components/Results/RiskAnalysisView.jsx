import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, TrendingUp, RefreshCw, Download, Shield, Clock } from 'lucide-react';
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

function RiskAnalysisView({ data: initialData, sessionId, onRegenerate }) {
    const [data, setData] = useState(initialData);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const { toast } = useToast();

    if (!data) return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="w-12 h-12 text-(--color-text-muted) mb-4" />
            <p className="text-(--color-text-secondary) text-lg font-medium mb-2">
                No risk analysis available
            </p>
            <p className="text-(--color-text-tertiary) text-sm">
                Generate a startup concept to see risk analysis
            </p>
        </div>
    );

    const handleRegenerate = async () => {
        setIsRegenerating(true);
        try {
            const result = await sessionApi.regenerate(sessionId, 'risk_analysis');
            setData(result.data);
            if (onRegenerate) onRegenerate(result.data);
            toast.success('Risk analysis regenerated!');
        } catch (error) {
            console.error('Failed to regenerate:', error);
            toast.error('Failed to regenerate analysis');
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
            {/* Hero with Score */}
            <motion.div variants={itemVariants} className="results-hero">
                <motion.div
                    className="results-hero-icon"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                    <ShieldCheck className="w-10 h-10 text-white" />
                </motion.div>

                <h1 className="results-hero-title">
                    Risk & Success Analysis
                </h1>

                <p className="results-hero-subtitle" style={{ marginBottom: 'var(--space-8)' }}>
                    Critical failure points and market timing assessment
                </p>

                {/* Risk Score Circle */}
                <div className="risk-score-container">
                    <div className="risk-score-circle">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="70" fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="12" />
                            <motion.circle
                                cx="80" cy="80" r="70" fill="transparent" stroke="white" strokeWidth="12"
                                strokeDasharray={439.82}
                                initial={{ strokeDashoffset: 439.82 }}
                                animate={{ strokeDashoffset: 439.82 - (439.82 * (data.risk_score?.score || 0)) / 100 }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="risk-score-value">
                            <span className="risk-score-percent">{data.risk_score?.score || 0}%</span>
                            <span className="risk-score-label">Success</span>
                        </div>
                    </div>

                    <span className={`risk-score-rating ${
                        data.risk_score?.score >= 80 ? 'high' : data.risk_score?.score >= 50 ? 'medium' : 'low'
                    }`}>
                        {data.risk_score?.rating || 'UNKNOWN'}
                    </span>

                    <p className="risk-score-justification">
                        {data.risk_score?.justification}
                    </p>
                </div>

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
                            const text = `RISK SCORE: ${data.risk_score?.score}% - ${data.risk_score?.rating}\n${data.risk_score?.justification}`;
                            const blob = new Blob([text], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'risk-analysis.txt';
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

            {/* Critical Risks */}
            {data.critical_risks && data.critical_risks.length > 0 && (
                <motion.div variants={itemVariants} className="results-section">
                    <div className="results-section-header">
                        <div className="results-section-icon">
                            <AlertTriangle />
                        </div>
                        <div>
                            <h2 className="results-section-title">Critical Risk Factors</h2>
                            <p className="results-section-subtitle">{data.critical_risks.length} key risks identified</p>
                        </div>
                    </div>

                    <div className="risk-list">
                        {data.critical_risks.map((risk, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className={`risk-card severity-${risk.severity?.toLowerCase() || 'medium'}`}
                            >
                                <div className="risk-card-header">
                                    <div className="risk-card-title-group">
                                        <span className={`risk-severity-badge ${risk.severity?.toLowerCase() || 'medium'}`}>
                                            {risk.severity}
                                        </span>
                                        <h4 className="risk-card-title">{risk.risk}</h4>
                                    </div>
                                    <div className="risk-card-number">{index + 1}</div>
                                </div>

                                <div className="risk-card-content">
                                    <div className="risk-impact">
                                        <p className="risk-label">Impact</p>
                                        <p className="risk-text">{risk.impact}</p>
                                    </div>

                                    <div className="risk-mitigation">
                                        <div className="risk-mitigation-header">
                                            <Shield className="w-4 h-4" />
                                            <p className="risk-label">Mitigation</p>
                                        </div>
                                        <p className="risk-text">{risk.mitigation}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Market Timing */}
            {data.market_timing && (
                <motion.div variants={itemVariants} className="results-section">
                    <div className="results-section-header">
                        <div className="results-section-icon">
                            <Clock />
                        </div>
                        <div>
                            <h2 className="results-section-title">Market Timing Assessment</h2>
                            <p className="results-section-subtitle">Is now the right time to launch?</p>
                        </div>
                    </div>

                    <div className="market-timing-card">
                        <span className="market-timing-verdict">{data.market_timing.verdict}</span>
                        <p className="market-timing-text">{data.market_timing.reasoning}</p>
                    </div>
                </motion.div>
            )}

            {/* Success Factors */}
            {data.success_factors && data.success_factors.length > 0 && (
                <motion.div variants={itemVariants} className="results-section">
                    <div className="results-section-header">
                        <div className="results-section-icon">
                            <TrendingUp />
                        </div>
                        <div>
                            <h2 className="results-section-title">Key Success Factors</h2>
                            <p className="results-section-subtitle">What needs to go right</p>
                        </div>
                    </div>

                    <div className="success-factors-grid">
                        {data.success_factors.map((factor, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.05 * index }}
                                className="success-factor-card"
                            >
                                <div className="success-factor-number">{index + 1}</div>
                                <p className="success-factor-text">{factor}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

export default RiskAnalysisView;
