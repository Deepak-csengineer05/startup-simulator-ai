import { motion } from 'framer-motion';
import { DollarSign, PieChart, Users, Share2, RefreshCw, Download } from 'lucide-react';
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

function BusinessModelView({ data: initialData, sessionId, onRegenerate }) {
    const [data, setData] = useState(initialData);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const { toast } = useToast();

    if (!data) return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <DollarSign className="w-12 h-12 text-[var(--color-text-muted)] mb-4" />
            <p className="text-[var(--color-text-secondary)] text-lg font-medium mb-2">
                No business model available
            </p>
            <p className="text-[var(--color-text-tertiary)] text-sm">
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
        } catch (error) {
            console.error('Failed to regenerate:', error);
        } finally {
            setIsRegenerating(false);
        }
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
                        Business Model
                    </h2>
                    <p className="text-[var(--color-text-secondary)]">
                        Revenue streams, cost structures, and operational logistics
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="btn btn-secondary text-sm inline-flex items-center gap-2"
                        aria-label="Regenerate business model"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                        <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
                    </button>
                    <button
                        onClick={() => {
                            const text = `REVENUE STREAMS:\n${data.revenue_streams?.map(s => `- ${s.name} (${s.pricing_model}): ${s.description}`).join('\n')}\n\nCOST STRUCTURE:\n${data.cost_structure?.map(c => `- ${c.name} (${c.type}): ${c.description}`).join('\n')}\n\nKEY PARTNERSHIPS:\n${data.key_partnerships?.map(p => `- ${p.partner}: ${p.rationale}`).join('\n')}\n\nCHANNELS:\n${data.channels?.map(ch => `- ${ch.channel}: ${ch.description}`).join('\n')}`;
                            const blob = new Blob([text], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'business-model.txt';
                            a.click();
                            URL.revokeObjectURL(url);
                            toast.success('Business model exported!');
                        }}
                        className="btn btn-secondary text-sm inline-flex items-center gap-2"
                        aria-label="Export business model as text file"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Revenue Streams */}
                <motion.div variants={itemVariants} className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[var(--color-success-bg)]">
                            <DollarSign className="w-5 h-5 text-[var(--color-success)]" />
                        </div>
                        <h3 className="h4">Revenue Streams</h3>
                    </div>
                    <div className="space-y-4">
                        {data.revenue_streams?.map((stream, idx) => (
                            <div key={idx} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-[var(--color-text-primary)]">{stream.name}</h4>
                                    <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-primary-bg)] text-[var(--color-primary)] font-medium">
                                        {stream.pricing_model}
                                    </span>
                                </div>
                                <p className="text-sm text-[var(--color-text-secondary)]">{stream.description}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Cost Structure */}
                <motion.div variants={itemVariants} className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[var(--color-error-bg)]">
                            <PieChart className="w-5 h-5 text-[var(--color-error)]" />
                        </div>
                        <h3 className="h4">Cost Structure</h3>
                    </div>
                    <div className="space-y-4">
                        {data.cost_structure?.map((cost, idx) => (
                            <div key={idx} className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--color-bg-hover)]">
                                <div
                                    className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                                        cost.type === 'Fixed' ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-info)]'
                                    }`}
                                />
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-[var(--color-text-primary)]">{cost.name}</h4>
                                        <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-primary-bg)] text-[var(--color-primary)] font-medium">
                                            {cost.type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--color-text-secondary)]">{cost.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Key Partnerships */}
                <motion.div variants={itemVariants} className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[var(--color-info-bg)]">
                            <Users className="w-5 h-5 text-[var(--color-info)]" />
                        </div>
                        <h3 className="h4">Key Partnerships</h3>
                    </div>
                    <div className="space-y-3">
                        {data.key_partnerships?.map((partner, idx) => (
                            <div key={idx} className="border-l-4 border-[var(--color-primary)] bg-[var(--color-bg-secondary)] p-3">
                                <h4 className="font-medium text-[var(--color-text-primary)]">{partner.partner}</h4>
                                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{partner.rationale}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Distribution Channels */}
                <motion.div variants={itemVariants} className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[var(--color-secondary-bg)]">
                            <Share2 className="w-5 h-5 text-[var(--color-secondary)]" />
                        </div>
                        <h3 className="h4">Channels</h3>
                    </div>
                    <ul className="space-y-3">
                        {data.channels?.map((channel, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary-bg)] text-xs font-bold text-[var(--color-secondary)]">
                                    {idx + 1}
                                </span>
                                <div>
                                    <span className="block font-medium text-[var(--color-text-primary)]">{channel.channel}</span>
                                    <span className="text-xs text-[var(--color-text-tertiary)]">{channel.description}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default BusinessModelView;
