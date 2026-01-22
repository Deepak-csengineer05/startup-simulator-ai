import { motion } from 'framer-motion';
import { Code, Server, Database, Cloud, Clock, Layers, Copy, Check } from 'lucide-react';
import { useState } from 'react';

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

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Code className="w-12 h-12 text-[var(--color-text-muted)] mb-4" />
                <p className="text-[var(--color-text-secondary)] text-lg font-medium mb-2">
                    No code preview available
                </p>
                <p className="text-[var(--color-text-tertiary)] text-sm">
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
            className="max-w-4xl mx-auto space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center">
                <h2 className="h2 mb-2">
                    Technical Blueprint
                </h2>
                <p className="text-[var(--color-text-secondary)]">
                    Recommended tech stack, architecture, and implementation
                </p>
            </motion.div>

            {/* Tech Stack */}
            {data.tech_stack && (
                <motion.div variants={itemVariants} className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[var(--color-primary-bg)]">
                            <Layers className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                        <h3 className="h4">
                            Recommended Tech Stack
                        </h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {['frontend', 'backend', 'database', 'hosting'].map((key) => {
                            const item = data.tech_stack[key];
                            if (!item) return null;
                            const Icon = stackIcons[key];

                            return (
                                <motion.div
                                    key={key}
                                    className="rounded-xl bg-[var(--color-bg-secondary)] p-4"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="rounded-lg p-2 bg-[var(--color-primary)] text-white">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                                            {key}
                                        </span>
                                    </div>
                                    <h4
                                        className="mb-1 font-semibold text-[var(--color-text-primary)]"
                                    >
                                        {item.framework || item.type || item.platform}
                                    </h4>
                                    {item.reasoning && (
                                        <p
                                            className="text-sm text-[var(--color-text-secondary)]"
                                        >
                                            {item.reasoning}
                                        </p>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Additional Tools */}
                    {data.tech_stack.additional && data.tech_stack.additional.length > 0 && (
                        <div className="mt-4">
                            <span
                                className="text-sm font-medium text-[var(--color-text-muted)]"
                            >
                                Additional Tools:
                            </span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {data.tech_stack.additional.map((tool, i) => (
                                    <span
                                        key={i}
                                        className="badge badge-primary"
                                    >
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Architecture */}
            {data.architecture && (
                <motion.div variants={itemVariants} className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[var(--color-secondary-bg)]">
                            <Server className="w-5 h-5 text-[var(--color-secondary)]" />
                        </div>
                        <h3 className="h4">
                            System Architecture
                        </h3>
                    </div>

                    {data.architecture.description && (
                        <p
                            className="mb-4 text-[var(--color-text-secondary)]"
                        >
                            {data.architecture.description}
                        </p>
                    )}

                    {data.architecture.components && (
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                            {data.architecture.components.map((comp, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl bg-[var(--color-bg-secondary)] p-4 text-center"
                                >
                                    <div
                                        className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white"
                                    >
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <h4
                                        className="mb-1 font-semibold text-[var(--color-text-primary)]"
                                    >
                                        {comp.name}
                                    </h4>
                                    <p
                                        className="mb-2 text-sm text-[var(--color-text-secondary)]"
                                    >
                                        {comp.purpose}
                                    </p>
                                    {comp.tech && (
                                        <span
                                            className="badge badge-primary"
                                        >
                                            {comp.tech}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {data.architecture.diagram_description && (
                        <div
                            className="code-block whitespace-pre-wrap"
                        >
                            {data.architecture.diagram_description}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Code Samples */}
            {data.code_samples && data.code_samples.length > 0 && (
                <motion.div variants={itemVariants} className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[var(--color-success-bg)]">
                            <Code className="w-5 h-5 text-[var(--color-success)]" />
                        </div>
                        <h3 className="h4">
                            Code Samples
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {data.code_samples.map((sample, index) => (
                            <div
                                key={index}
                                className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
                            >
                                <div
                                    className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="badge badge-primary"
                                        >
                                            {sample.language || 'code'}
                                        </span>
                                        <span
                                            className="font-medium text-[var(--color-text-primary)]"
                                        >
                                            {sample.title}
                                        </span>
                                    </div>
                                    <motion.button
                                        onClick={() => copyToClipboard(sample.code, index)}
                                        className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        aria-label="Copy code to clipboard"
                                    >
                                        {copiedCode === index ? (
                                            <Check className="w-4 h-4 text-[var(--color-success)]" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </motion.button>
                                </div>
                                {sample.description && (
                                    <p
                                        className="border-b border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-secondary)]"
                                    >
                                        {sample.description}
                                    </p>
                                )}
                                <pre className="code-block rounded-none border-0">
                                    <code>{sample.code}</code>
                                </pre>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Development Timeline */}
            {data.timeline && (
                <motion.div variants={itemVariants} className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[var(--color-warning-bg)]">
                            <Clock className="w-5 h-5 text-[var(--color-warning)]" />
                        </div>
                        <h3 className="h4">
                            Development Timeline
                        </h3>
                        {data.timeline.total_weeks && (
                            <span
                                className="badge badge-primary"
                            >
                                ~{data.timeline.total_weeks} weeks total
                            </span>
                        )}
                    </div>
                    <div className="space-y-4">
                        {data.timeline.phases?.map((phase, index) => (
                            <motion.div
                                key={index}
                                className="flex gap-4"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="flex flex-col items-center">
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-bold"
                                    >
                                        {index + 1}
                                    </div>
                                    {index < data.timeline.phases.length - 1 && (
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
                                            {phase.phase}
                                        </h4>
                                        <span
                                            className="badge badge-primary"
                                        >
                                            Weeks {phase.weeks}
                                        </span>
                                    </div>
                                    <ul className="space-y-1">
                                        {phase.deliverables?.map((item, i) => (
                                            <li
                                                key={i}
                                                className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"
                                            >
                                                <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
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
