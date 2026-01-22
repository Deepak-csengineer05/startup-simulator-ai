import { motion } from 'framer-motion';
import { Presentation, ChevronLeft, ChevronRight, MessageSquare, Copy, Download, Share2, Check } from 'lucide-react';
import { useState } from 'react';
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

function PitchDeckView({ data }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    if (!data || !data.slides) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Presentation className="w-12 h-12 text-[var(--color-text-muted)] mb-4" />
                <p className="text-[var(--color-text-secondary)] text-lg font-medium mb-2">
                    No pitch deck available
                </p>
                <p className="text-[var(--color-text-tertiary)] text-sm">
                    Generate a startup concept to see pitch deck outline
                </p>
            </div>
        );
    }

    const slides = data.slides;
    const slide = slides[currentSlide];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
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
                    Pitch Deck Outline
                </h2>
                <p className="text-[var(--color-text-secondary)]">
                    10-slide investor-ready presentation structure
                </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        const text = slides.map((s, i) => `Slide ${i + 1}: ${s.title}\n${s.content.join('\n')}\n${s.speaker_notes ? 'Notes: ' + s.speaker_notes : ''}`).join('\n\n');
                        navigator.clipboard.writeText(text);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                        toast.success('Pitch deck copied to clipboard!');
                    }}
                    className="btn btn-secondary inline-flex items-center gap-2"
                    aria-label="Copy pitch deck to clipboard"
                >
                    {copied ? <Check className="h-[18px] w-[18px]" /> : <Copy className="h-[18px] w-[18px]" />}
                    <span>{copied ? 'Copied!' : 'Copy All'}</span>
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        const text = slides.map((s, i) => `Slide ${i + 1}: ${s.title}\n${s.content.join('\n')}\n${s.speaker_notes ? 'Notes: ' + s.speaker_notes : ''}`).join('\n\n');
                        const blob = new Blob([text], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'pitch-deck.txt';
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success('Pitch deck exported!');
                    }}
                    className="btn btn-secondary inline-flex items-center gap-2"
                    aria-label="Export pitch deck as text file"
                >
                    <Download className="h-[18px] w-[18px]" />
                    <span>Export</span>
                </motion.button>
            </motion.div>

            {/* Slide Preview */}
            <motion.div
                variants={itemVariants}
                className="card overflow-hidden"
            >
                {/* Slide Content */}
                <div
                    className="relative mb-4 aspect-video overflow-hidden rounded-xl text-white [background:var(--gradient-hero)]"
                >
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span
                                className="text-sm font-medium opacity-70 mb-2 inline-block px-3 py-1 rounded-full bg-white/20"
                            >
                                Slide {slide.number || currentSlide + 1} of {slides.length}
                            </span>
                            <h3 className="text-2xl md:text-3xl font-bold mb-4">
                                {slide.title}
                            </h3>
                            {slide.headline && (
                                <p className="text-lg opacity-90 mb-6">
                                    {slide.headline}
                                </p>
                            )}
                            {slide.bullets && slide.bullets.length > 0 && (
                                <ul className="text-left max-w-md mx-auto space-y-2">
                                    {slide.bullets.map((bullet, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="opacity-60">•</span>
                                            <span className="opacity-90">{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </motion.div>
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Slide Thumbnails */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {slides.map((s, index) => (
                        <motion.button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`flex h-12 w-20 flex-shrink-0 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                                currentSlide === index
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={`Go to slide ${s.number || index + 1}`}
                        >
                            {s.number || index + 1}
                        </motion.button>
                    ))}
                </div>

                {/* Speaker Notes */}
                {slide.speaker_notes && (
                    <div
                        className="mt-4 rounded-xl bg-[var(--color-bg-secondary)] p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <MessageSquare
                                className="w-4 h-4 text-[var(--color-primary)]"
                            />
                            <span
                                className="text-sm font-medium text-[var(--color-text-primary)]"
                            >
                                Speaker Notes
                            </span>
                        </div>
                        <p
                            className="text-sm text-[var(--color-text-secondary)]"
                        >
                            {slide.speaker_notes}
                        </p>
                    </div>
                )}
            </motion.div>

            {/* All Slides Overview */}
            <motion.div variants={itemVariants} className="card">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-[var(--color-primary-bg)]">
                        <Presentation className="w-5 h-5 text-[var(--color-primary)]" />
                    </div>
                    <h3 className="h4">
                        Deck Overview
                    </h3>
                </div>
                <div className="space-y-3">
                    {slides.map((s, index) => (
                        <motion.div
                            key={index}
                            className={`flex cursor-pointer items-start gap-4 rounded-xl p-3 transition-colors ${
                                currentSlide === index ? 'bg-[var(--color-primary-bg)]' : 'hover:bg-[var(--color-bg-hover)]'
                            }`}
                            onClick={() => setCurrentSlide(index)}
                            whileHover={{ x: 5 }}
                        >
                            <div
                                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg font-semibold ${
                                    currentSlide === index
                                        ? 'text-white [background:var(--gradient-primary)]'
                                        : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]'
                                }`}
                            >
                                {s.number || index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4
                                    className="font-medium text-[var(--color-text-primary)]"
                                >
                                    {s.title}
                                </h4>
                                {s.headline && (
                                    <p
                                        className="truncate text-sm text-[var(--color-text-secondary)]"
                                    >
                                        {s.headline}
                                    </p>
                                )}
                            </div>
                            {s.type && (
                                <span
                                    className="badge badge-primary capitalize"
                                >
                                    {s.type}
                                </span>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}

export default PitchDeckView;
