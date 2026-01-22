import { motion } from 'framer-motion';
import { BarChart3, Users, Shield, TrendingUp, Target, Zap } from 'lucide-react';

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



function MarketView({ data }) {


    // Add this check at the beginning of the component:
    if (!data || (!data.market_size && !data.competitors)) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <BarChart3 className="w-12 h-12 text-[var(--color-text-muted)] mb-4" />
                <p className="text-[var(--color-text-secondary)] text-lg font-medium mb-2">
                    No market analysis available
                </p>
                <p className="text-[var(--color-text-tertiary)] text-sm">
                    Generate a startup concept to see market analysis
                </p>
            </div>
        );
    }

    // Update the TAM/SAM/SOM mapping to handle both string and object formats:
    const labels = {
        tam: { name: 'Total Addressable Market', description: data.market_size?.tam?.description || '' },
        sam: { name: 'Serviceable Addressable Market', description: data.market_size?.sam?.description || '' },
        som: { name: 'Serviceable Obtainable Market', description: data.market_size?.som?.description || '' }
    };

    const swotColors = {
        strengths: {
            bgClass: 'bg-[var(--color-success-bg)]',
            textClass: 'text-[var(--color-success)]',
            icon: Zap
        },
        weaknesses: {
            bgClass: 'bg-[var(--color-error-bg)]',
            textClass: 'text-[var(--color-error)]',
            icon: Shield
        },
        opportunities: {
            bgClass: 'bg-[var(--color-info-bg)]',
            textClass: 'text-[var(--color-info)]',
            icon: TrendingUp
        },
        threats: {
            bgClass: 'bg-[var(--color-warning-bg)]',
            textClass: 'text-[var(--color-warning)]',
            icon: Target
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
            <motion.div variants={itemVariants} className="text-center">
                <h2 className="h2 mb-2">
                    Market Analysis
                </h2>
                <p className="text-[var(--color-text-secondary)]">
                    Market size, competition, and go-to-market strategy
                </p>
            </motion.div>

            {/* Market Size */}
            {data.market_size && (
                <motion.div variants={itemVariants} className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[var(--color-primary-bg)]">
                            <BarChart3 className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                        <h3 className="h4">
                            Market Size
                        </h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        {['tam', 'sam', 'som'].map((key) => {
                            const item = data.market_size[key];
                            if (!item) return null;

                            const labels = {
                                tam: 'Total Addressable Market',
                                sam: 'Serviceable Addressable Market',
                                som: 'Serviceable Obtainable Market'
                            };

                            return (
                                <div
                                    key={key}
                                    className="rounded-xl bg-[var(--color-bg-secondary)] p-5 text-center"
                                >
                                    <p
                                        className="mb-2 text-3xl font-bold text-[var(--color-primary)]"
                                    >
                                        {item.value}
                                    </p>
                                    <p
                                        className="mb-1 text-sm font-medium uppercase tracking-wide text-[var(--color-text-muted)]"
                                    >
                                        {key.toUpperCase()}
                                    </p>
                                    <p
                                        className="text-xs text-[var(--color-text-tertiary)]"
                                    >
                                        {labels[key]}
                                    </p>
                                    {item.description && (
                                        <p
                                            className="mt-2 text-xs text-[var(--color-text-secondary)]"
                                        >
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Competitors */}
            {data.competitors && data.competitors.length > 0 && (
                <motion.div variants={itemVariants} className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[var(--color-secondary-bg)]">
                            <Users className="w-5 h-5 text-[var(--color-secondary)]" />
                        </div>
                        <h3 className="h4">
                            Competitive Landscape
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {data.competitors.map((competitor, index) => (
                            <div
                                key={index}
                                className="rounded-xl bg-[var(--color-bg-secondary)] p-4"
                            >
                                <h4
                                    className="mb-2 font-semibold text-[var(--color-text-primary)]"
                                >
                                    {competitor.name}
                                </h4>
                                <p
                                    className="mb-3 text-sm text-[var(--color-text-secondary)]"
                                >
                                    {competitor.description}
                                </p>
                                <div className="grid md:grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)] font-medium">
                                            Strengths
                                        </span>
                                        <span className="text-[var(--color-text-tertiary)]">
                                            {competitor.strengths}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-error-bg)] text-[var(--color-error)] font-medium">
                                            Weaknesses
                                        </span>
                                        <span className="text-[var(--color-text-tertiary)]">
                                            {competitor.weaknesses}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* SWOT Analysis */}
            {data.swot && (
                <motion.div variants={itemVariants} className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[var(--color-info-bg)]">
                            <Target className="w-5 h-5 text-[var(--color-info)]" />
                        </div>
                        <h3 className="h4">
                            SWOT Analysis
                        </h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(data.swot).map(([key, items]) => {
                            const config = swotColors[key];
                            if (!config || !items) return null;
                            const Icon = config.icon;

                            return (
                                <div
                                    key={key}
                                    className={`rounded-xl p-4 ${config.bgClass}`}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <Icon className={`w-4 h-4 ${config.textClass}`} />
                                        <h4
                                            className={`font-semibold capitalize ${config.textClass}`}
                                        >
                                            {key}
                                        </h4>
                                    </div>
                                    <ul className="space-y-2">
                                        {items.map((item, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
                                            >
                                                <span className={config.textClass}>•</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Go to Market */}
            {data.go_to_market && (
                <motion.div variants={itemVariants} className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[var(--color-primary-bg)]">
                            <TrendingUp className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                        <h3 className="h4">
                            Go-to-Market Strategy
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(data.go_to_market).map(([key, phase], index) => (
                            <div
                                key={key}
                                className="flex gap-4"
                            >
                                <div className="flex flex-col items-center">
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold bg-[var(--color-primary)]"
                                    >
                                        {index + 1}
                                    </div>
                                    {index < Object.keys(data.go_to_market).length - 1 && (
                                        <div
                                            className="my-2 w-0.5 flex-1 bg-[var(--color-border)]"
                                        />
                                    )}
                                </div>
                                <div className="flex-1 pb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4
                                            className="font-semibold text-[var(--color-text-primary)]"
                                        >
                                            {phase.name}
                                        </h4>
                                        <span
                                            className="badge badge-primary"
                                        >
                                            {phase.duration}
                                        </span>
                                    </div>
                                    <ul className="space-y-1">
                                        {phase.activities?.map((activity, i) => (
                                            <li
                                                key={i}
                                                className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"
                                            >
                                                <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                                                {activity}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

export default MarketView;
