import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, Palette, Copy, Check, Download, Quote, Type, Eye } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '../shared/Toast';
import { VisualCard } from '../shared/VisualCard';
import { SectionHeader } from '../shared/SectionHeader';
import { BadgePill } from '../shared/BadgePill';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06 }
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
                <Sparkles className="w-10 h-10 text-(--color-text-muted) mb-3" />
                <p className="text-(--color-text-secondary) text-base font-medium">
                    No brand data available
                </p>
                <p className="text-(--color-text-tertiary) text-sm mt-1">
                    Generate a startup concept to view brand identity
                </p>
            </div>
        );
    }

    const copyToClipboard = async (hex) => {
        try {
            await navigator.clipboard.writeText(hex);
            setCopiedColor(hex);
            toast.success(`Copied ${hex}`);
            setTimeout(() => setCopiedColor(null), 2000);
        } catch (err) {
            console.error('Copy failed', err);
        }
    };

    const primaryBrandName = data.name_options?.[0];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-6xl mx-auto space-y-8"
        >
            {/* Hero Brand Showcase */}
            <motion.div variants={itemVariants}>
                <VisualCard variant="gradient" className="text-center py-16">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                        <Sparkles className="w-12 h-12 text-white mx-auto mb-6" />
                    </motion.div>
                    
                    <motion.h1 
                        className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {primaryBrandName || 'Your Brand'}
                    </motion.h1>
                    
                    {data.taglines?.[0] && (
                        <motion.p 
                            className="text-xl md:text-2xl text-white/90 italic font-light max-w-3xl mx-auto mb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            "{data.taglines[0]}"
                        </motion.p>
                    )}

                    {/* Action Buttons */}
                    <motion.div 
                        className="flex items-center justify-center gap-3 flex-wrap"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <button
                            onClick={() => {
                                const text = `Brand Names: ${data.name_options?.join(', ')}\nTaglines: ${data.taglines?.join(' / ')}\nColors: ${data.color_palette?.map(c => typeof c === 'string' ? c : c.hex).join(', ')}\nVoice & Tone: ${data.voice_tone}`;
                                navigator.clipboard.writeText(text);
                                toast.success('Brand identity copied!');
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-(--color-primary) font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                        >
                            <Copy className="h-5 w-5" />
                            <span>Copy All</span>
                        </button>

                        <button
                            onClick={() => {
                                const text = `Brand Names: ${data.name_options?.join(', ')}\nTaglines: ${data.taglines?.join(' / ')}\nColors: ${data.color_palette?.map(c => typeof c === 'string' ? c : c.hex).join(', ')}\nVoice & Tone: ${data.voice_tone}`;
                                const blob = new Blob([text], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'brand-identity.txt';
                                a.click();
                                URL.revokeObjectURL(url);
                                toast.success('Exported successfully!');
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur text-white font-semibold border-2 border-white/30 hover:bg-white/20 transition-all"
                        >
                            <Download className="h-5 w-5" />
                            <span>Export</span>
                        </button>
                    </motion.div>
                </VisualCard>
            </motion.div>

            {/* Brand Name Options */}
            <motion.div variants={itemVariants}>
                <VisualCard variant="elevated" hover>
                    <SectionHeader 
                        icon={Type}
                        title="Brand Name Options"
                        subtitle="AI-generated name variations for your startup"
                        iconColor="primary"
                    />

                    <div className="flex flex-wrap gap-4 mt-6">
                        {data.name_options?.map((name, index) => (
                            <motion.div
                                key={index}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1 * index, type: 'spring' }}
                                whileHover={{ scale: 1.05 }}
                                className={`group cursor-pointer ${
                                    index === 0
                                        ? 'bg-gradient-to-r from-(--color-primary) to-(--color-secondary) text-white shadow-lg shadow-(--color-primary)/30'
                                        : 'bg-(--color-bg-secondary) border-2 border-(--color-border) hover:border-(--color-primary)'
                                } rounded-2xl px-8 py-4 transition-all`}
                            >
                                {index === 0 && (
                                    <BadgePill severity="default" size="sm" className="mb-2">
                                        Primary
                                    </BadgePill>
                                )}
                                <p className={`text-2xl font-bold ${index === 0 ? 'text-white' : 'text-(--color-text-primary)'}`}>
                                    {name}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </VisualCard>
            </motion.div>

            {/* Color Palette - LARGE Swatches */}
            <motion.div variants={itemVariants}>
                <VisualCard variant="default">
                    <SectionHeader 
                        icon={Palette}
                        title="Brand Color Palette"
                        subtitle="Click any color to copy hex code"
                        iconColor="secondary"
                    />

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-6">
                        {data.color_palette?.map((color, index) => {
                            const hex = typeof color === 'string' ? color : color.hex;
                            const name = typeof color === 'string' ? `Color ${index + 1}` : (color.name || `Color ${index + 1}`);
                            const isCopied = copiedColor === hex;

                            return (
                                <motion.button
                                    key={index}
                                    onClick={() => copyToClipboard(hex)}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 * index }}
                                    whileHover={{ scale: 1.05, y: -8 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group relative text-left"
                                >
                                    {/* Large Color Swatch */}
                                    <div
                                        className="h-32 rounded-2xl border-4 border-(--color-border) group-hover:border-(--color-primary) transition-all shadow-lg group-hover:shadow-xl relative overflow-hidden"
                                        style={{ backgroundColor: hex }}
                                    >
                                        {/* Copy Indicator */}
                                        <AnimatePresence>
                                            {isCopied && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                    className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                                                >
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Check className="w-8 h-8 text-white" />
                                                        <span className="text-white font-semibold text-sm">Copied!</span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Hover Copy Icon */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                            <Copy className="w-6 h-6 text-white" />
                                        </div>
                                    </div>

                                    {/* Color Info */}
                                    <div className="mt-3">
                                        <p className="font-mono text-lg font-bold text-(--color-text-primary) mb-1">
                                            {hex.toUpperCase()}
                                        </p>
                                        <p className="text-sm text-(--color-text-muted) capitalize">
                                            {name}
                                        </p>
                                    </div>

                                    {/* Primary Badge */}
                                    {index === 0 && (
                                        <BadgePill severity="default" size="sm" className="absolute top-2 left-2">
                                            Primary
                                        </BadgePill>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Color Usage Preview */}
                    {data.color_palette && data.color_palette.length > 0 && (
                        <div className="mt-8 p-6 rounded-2xl bg-(--color-bg-secondary) border border-(--color-border)">
                            <div className="flex items-center gap-2 mb-4">
                                <Eye className="w-5 h-5 text-(--color-primary)" />
                                <h4 className="font-semibold text-(--color-text-primary)">Usage Preview</h4>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {data.color_palette.slice(0, 3).map((color, idx) => {
                                    const hex = typeof color === 'string' ? color : color.hex;
                                    return (
                                        <button
                                            key={idx}
                                            className="px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                                            style={{ backgroundColor: hex, color: '#fff' }}
                                        >
                                            Button {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </VisualCard>
            </motion.div>

            {/* Taglines - Typography Showcase */}
            <motion.div variants={itemVariants}>
                <VisualCard variant="outlined">
                    <SectionHeader 
                        icon={Quote}
                        title="Brand Taglines"
                        subtitle="Memorable phrases that capture your essence"
                        iconColor="info"
                    />

                    <div className="space-y-5 mt-6">
                        {data.taglines?.map((tagline, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                                whileHover={{ x: 10 }}
                                className="group relative"
                            >
                                <div className="flex gap-6 items-start p-6 rounded-2xl bg-(--color-bg-secondary) hover:bg-(--color-bg-hover) border-2 border-transparent hover:border-(--color-primary) transition-all">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-primary) text-white font-bold shadow-md">
                                            {index + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xl md:text-2xl italic font-light text-(--color-text-primary) leading-relaxed">
                                            "{tagline}"
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </VisualCard>
            </motion.div>

            {/* Voice & Tone */}
            <motion.div variants={itemVariants}>
                <VisualCard variant="elevated" hover>
                    <SectionHeader 
                        icon={MessageSquare}
                        title="Voice & Tone"
                        subtitle="How your brand speaks and connects"
                        iconColor="success"
                    />
                    <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-(--color-success-bg) to-(--color-info-bg) border border-(--color-border)">
                        <p className="text-lg leading-relaxed text-(--color-text-primary)">
                            {data.voice_tone}
                        </p>
                    </div>
                </VisualCard>
            </motion.div>
        </motion.div>
    );
}

export default BrandView;
