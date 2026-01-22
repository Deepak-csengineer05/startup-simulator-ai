import { motion } from 'framer-motion';
import { Target, Lightbulb, Users, Layers, Copy, Download } from 'lucide-react';
import { useToast } from '../shared/Toast';

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

function ThesisView({ data }) {
    const { toast } = useToast();
    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Target className="w-12 h-12 text-[var(--color-text-muted)] mb-4" />
                <p className="text-[var(--color-text-secondary)] text-lg font-medium mb-2">
                    No concept data available
                </p>
                <p className="text-[var(--color-text-tertiary)] text-sm">
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
            className="max-w-4xl mx-auto space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center">
                <h2 className="h2 mb-2">
                    Refined Concept
                </h2>
                <p className="text-[var(--color-text-secondary)]">
                    Your startup idea, structured and validated
                </p>

                {/* Action Buttons */}
                <div className="mt-4 flex items-center justify-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            const text = `PROBLEM:\n${data.problem_summary}\n\nSOLUTION:\n${data.solution_summary}\n\nTARGET USERS:\n${data.target_users?.join(', ')}\n\nMVP FEATURES:\n${data.core_features?.map((f, i) => `${i + 1}. ${f}`).join('\n')}`;
                            navigator.clipboard.writeText(text);
                            toast.success('Concept thesis copied to clipboard!');
                        }}
                        className="btn btn-secondary inline-flex items-center gap-2"
                        aria-label="Copy concept thesis to clipboard"
                    >
                        <Copy className="h-[18px] w-[18px]" />
                        <span>Copy All</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
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
                        className="btn btn-secondary inline-flex items-center gap-2"
                        aria-label="Export concept thesis as text file"
                    >
                        <Download className="h-[18px] w-[18px]" />
                        <span>Export</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* Problem & Solution Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Problem */}
                <motion.div variants={itemVariants} className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[var(--color-error-bg)]">
                            <Target className="w-5 h-5 text-[var(--color-error)]" />
                        </div>
                        <h3 className="h4">
                            The Problem
                        </h3>
                    </div>
                    <p
                        className="leading-relaxed text-[var(--color-text-secondary)]"
                    >
                        {data.problem_summary}
                    </p>
                </motion.div>

                {/* Solution */}
                <motion.div variants={itemVariants} className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[var(--color-success-bg)]">
                            <Lightbulb className="w-5 h-5 text-[var(--color-success)]" />
                        </div>
                        <h3 className="h4">
                            The Solution
                        </h3>
                    </div>
                    <p
                        className="leading-relaxed text-[var(--color-text-secondary)]"
                    >
                        {data.solution_summary}
                    </p>
                </motion.div>
            </div>

            {/* Target Users */}
            <motion.div variants={itemVariants} className="card">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-[var(--color-primary-bg)]">
                        <Users className="w-5 h-5 text-[var(--color-primary)]" />
                    </div>
                    <h3 className="h4">
                        Target Users
                    </h3>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    {data.target_users?.map((user, index) => (
                        <div
                            key={index}
                            className="rounded-xl bg-[var(--color-bg-secondary)] p-4"
                        >
                            <div
                                className="mb-3 flex h-10 w-10 items-center justify-center rounded-full text-white font-bold bg-[var(--color-primary)]"
                            >
                                {index + 1}
                            </div>
                            <p
                                className="text-sm text-[var(--color-text-secondary)]"
                            >
                                {user}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Core Features */}
            <motion.div variants={itemVariants} className="card">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-[var(--color-secondary-bg)]">
                        <Layers className="w-5 h-5 text-[var(--color-secondary)]" />
                    </div>
                    <h3 className="h4">
                        MVP Core Features
                    </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                    {data.core_features?.map((feature, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-3 rounded-xl bg-[var(--color-bg-secondary)] p-4"
                        >
                            <div
                                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-bg)] text-xs font-semibold text-[var(--color-primary)]"
                            >
                                {index + 1}
                            </div>
                            <p
                                className="text-sm text-[var(--color-text-secondary)]"
                            >
                                {feature}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}

export default ThesisView;
