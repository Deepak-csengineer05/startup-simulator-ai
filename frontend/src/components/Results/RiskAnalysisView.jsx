import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, TrendingUp, RefreshCw, Download } from 'lucide-react';
import { useState } from 'react';
import { sessionApi } from '../../services/api';
import { useToast } from '../shared/Toast';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
            <AlertTriangle className="w-12 h-12 text-[var(--color-text-muted)] mb-4" />
            <p className="text-[var(--color-text-secondary)] text-lg font-medium mb-2">
                No risk analysis available
            </p>
            <p className="text-[var(--color-text-tertiary)] text-sm">
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
        } catch (error) {
            console.error('Failed to regenerate:', error);
        } finally {
            setIsRegenerating(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-[var(--color-success)]';
        if (score >= 50) return 'text-[var(--color-warning)]';
        return 'text-[var(--color-error)]';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-[var(--color-success)]';
        if (score >= 50) return 'bg-[var(--color-warning)]';
        return 'bg-[var(--color-error)]';
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="h2 mb-2">
                        Risk & Success Probability
                    </h2>
                    <p className="text-[var(--color-text-secondary)]">
                        Critical failure analysis and market timing verdict
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="btn btn-secondary text-sm inline-flex items-center gap-2"
                        aria-label="Regenerate risk analysis"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                        <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
                    </button>
                    <button
                        onClick={() => {
                            const text = `RISK SCORE: ${data.risk_score?.score}% - ${data.risk_score?.rating}\n${data.risk_score?.justification}\n\nCRITICAL RISKS:\n${data.critical_risks?.map(r => `- ${r.risk} (${r.severity}): ${r.impact}\n  Mitigation: ${r.mitigation}`).join('\n\n')}\n\nMARKET TIMING:\n${data.market_timing?.verdict}\n${data.market_timing?.reasoning}`;
                            const blob = new Blob([text], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'risk-analysis.txt';
                            a.click();
                            URL.revokeObjectURL(url);
                            toast.success('Risk analysis exported!');
                        }}
                        className="btn btn-secondary text-sm inline-flex items-center gap-2"
                        aria-label="Export risk analysis as text file"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Score Card */}
            <motion.div variants={itemVariants} className="card flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <div className="relative w-32 h-32 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="12"
                            className="text-[var(--color-border)]"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="12"
                            strokeDasharray={351.86}
                            strokeDashoffset={351.86 - (351.86 * data.risk_score?.score) / 100}
                            className={`${getScoreColor(data.risk_score?.score)} transition-all duration-1000 ease-out`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${getScoreColor(data.risk_score?.score)}`}>
                            {data.risk_score?.score}%
                        </span>
                        <span className="text-xs uppercase font-semibold text-[var(--color-text-muted)]">Success</span>
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                            {data.risk_score?.rating}
                        </h3>
                        <span className={`badge text-white ${getScoreBg(data.risk_score?.score)}`}>
                            VERDICT
                        </span>
                    </div>
                    <p className="leading-relaxed text-[var(--color-text-secondary)]">
                        {data.risk_score?.justification}
                    </p>
                </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Critical Risks */}
                <motion.div variants={itemVariants} className="card space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-[var(--color-error-bg)]">
                            <AlertTriangle className="w-5 h-5 text-[var(--color-error)]" />
                        </div>
                        <h3 className="h4">Critical Failure Modes</h3>
                    </div>
                    {data.critical_risks?.map((risk, idx) => (
                        <div key={idx} className="rounded-xl bg-[var(--color-bg-secondary)] p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-[var(--color-text-primary)]">{risk.risk}</h4>
                                <span
                                    className={`badge ${
                                        risk.severity === 'High'
                                            ? 'badge-error'
                                            : risk.severity === 'Medium'
                                                ? 'badge-warning'
                                                : 'badge-primary'
                                    }`}
                                >
                                    {risk.severity} Sev
                                </span>
                            </div>
                            <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
                                {risk.impact}
                            </p>
                            <div className="flex items-start gap-2 rounded bg-[var(--color-primary-bg)] p-2 text-sm text-[var(--color-text-secondary)]">
                                <ShieldCheck className="mt-0.5 w-4 h-4 flex-shrink-0 text-[var(--color-primary)]" />
                                <span><span className="font-semibold">Mitigation:</span> {risk.mitigation}</span>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Market Timing */}
                <motion.div variants={itemVariants} className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[var(--color-info-bg)]">
                            <TrendingUp className="w-5 h-5 text-[var(--color-info)]" />
                        </div>
                        <h3 className="h4">Market Timing</h3>
                    </div>
                    <div className="rounded-2xl border border-[var(--color-border)] p-6 text-center [background:var(--gradient-card)]">
                        <h4 className="mb-2 text-2xl font-bold text-[var(--color-primary)]">
                            {data.market_timing?.verdict}
                        </h4>
                        <p className="text-[var(--color-text-secondary)]">
                            {data.market_timing?.reasoning}
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default RiskAnalysisView;
