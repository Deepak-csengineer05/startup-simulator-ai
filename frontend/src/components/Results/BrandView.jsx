import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, Palette, Copy, Check, Download } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '../shared/Toast';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 }
};

function BrandView({ data }) {
    const [copiedColor, setCopiedColor] = useState(null);
    const { toast } = useToast();

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Sparkles className="w-10 h-10 text-[var(--color-text-muted)] mb-3" />
                <p className="text-[var(--color-text-secondary)] text-base font-medium">
                    No brand data available
                </p>
                <p className="text-[var(--color-text-tertiary)] text-sm mt-1">
                    Generate a startup concept to view brand identity
                </p>
            </div>
        );
    }

    const copyToClipboard = async (hex) => {
        try {
            await navigator.clipboard.writeText(hex);
            setCopiedColor(hex);
            setTimeout(() => setCopiedColor(null), 1500);
        } catch (err) {
            console.error('Copy failed', err);
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
                <h2 className="h2 mb-1">Brand Identity</h2>
                <p className="text-[var(--color-text-secondary)] text-sm">
                    AI-generated visual & verbal identity
                </p>

                <div className="mt-4 flex justify-center gap-3">
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            const text = `Brand Names: ${data.name_options?.join(', ')}\nTaglines: ${data.taglines?.join(', ')}\nColors: ${data.color_palette?.map(c => c.hex).join(', ')}`;
                            navigator.clipboard.writeText(text);
                            toast.success('Brand identity copied');
                        }}
                        className="btn btn-secondary inline-flex items-center gap-2"
                    >
                        <Copy className="h-4 w-4" />
                        Copy All
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            const text = `Brand Names: ${data.name_options?.join(', ')}\nTaglines: ${data.taglines?.join(', ')}\nColors: ${data.color_palette?.map(c => c.hex).join(', ')}`;
                            const blob = new Blob([text], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'brand-identity.txt';
                            a.click();
                            URL.revokeObjectURL(url);
                            toast.success('Exported successfully');
                        }}
                        className="btn btn-ghost border border-[var(--color-border)] inline-flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </motion.button>
                </div>
            </motion.div>

            {/* Brand Names – PRIMARY */}
            <motion.div
                variants={itemVariants}
                className="card border border-[var(--color-primary)]/30 bg-[var(--color-primary-bg)]"
            >
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
                    <h3 className="h4">Brand Name Options</h3>
                </div>

                <div className="flex flex-wrap gap-3">
                    {data.name_options?.map((name, index) => (
                        <div
                            key={index}
                            className={`rounded-xl px-5 py-3 text-sm font-semibold ${
                                index === 0
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]'
                            }`}
                        >
                            {name}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Taglines */}
            <motion.div variants={itemVariants} className="card">
                <div className="flex items-center gap-3 mb-4">
                    <MessageSquare className="w-5 h-5 text-[var(--color-accent)]" />
                    <h3 className="h4">Taglines</h3>
                </div>

                <div className="space-y-3">
                    {data.taglines?.map((tagline, index) => (
                        <div
                            key={index}
                            className="flex gap-4 border border-[var(--color-border)] rounded-lg p-4"
                        >
                            <span className="text-sm font-mono text-[var(--color-text-muted)]">
                                {index + 1}.
                            </span>
                            <p className="italic text-sm text-[var(--color-text-secondary)]">
                                “{tagline}”
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Voice & Tone */}
            <motion.div variants={itemVariants} className="card">
                <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="w-5 h-5 text-[var(--color-info)]" />
                    <h3 className="h4">Voice & Tone</h3>
                </div>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {data.voice_tone}
                </p>
            </motion.div>

            {/* Color Palette – Reference */}
            <motion.div variants={itemVariants} className="card">
                <div className="flex items-center gap-3 mb-4">
                    <Palette className="w-5 h-5 text-[var(--color-secondary)]" />
                    <h3 className="h4">Color Palette</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {data.color_palette?.map((color, index) => {
                        const hex = typeof color === 'string' ? color : color.hex;
                        const name = typeof color === 'string' ? null : color.name;

                        return (
                            <button
                                key={index}
                                onClick={() => copyToClipboard(hex)}
                                className="text-left"
                            >
                                <div
                                    className="h-20 rounded-lg border border-[var(--color-border)] mb-2"
                                    style={{ backgroundColor: hex }}
                                />
                                <p className="font-mono text-xs text-[var(--color-text-primary)]">
                                    {hex}
                                </p>
                                {name && (
                                    <p className="text-xs text-[var(--color-text-muted)]">
                                        {name}
                                    </p>
                                )}
                            </button>
                        );
                    })}
                </div>
            </motion.div>
        </motion.div>
    );
}

export default BrandView;
