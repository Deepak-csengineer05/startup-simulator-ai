import { motion } from 'framer-motion';
import { Presentation, ChevronLeft, ChevronRight, Copy, Download, Check } from 'lucide-react';
import { useState } from 'react';
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

function PitchDeckView({ data }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    if (!data || !data.slides) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Presentation className="w-12 h-12 text-(--color-text-muted) mb-4" />
                <p className="text-(--color-text-secondary) text-lg font-medium mb-2">
                    No pitch deck available
                </p>
                <p className="text-(--color-text-tertiary) text-sm">
                    Generate a startup concept to see pitch deck outline
                </p>
            </div>
        );
    }

    const slides = data.slides;
    const slide = slides[currentSlide];

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

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
                    <Presentation className="w-10 h-10 text-white" />
                </motion.div>

                <h1 className="results-hero-title">
                    Pitch Deck Outline
                </h1>

                <p className="results-hero-subtitle">
                    10-slide investor-ready presentation structure
                </p>

                <div className="results-hero-actions">
                    <button
                        onClick={() => {
                            const text = slides.map((s, i) => `Slide ${i + 1}: ${s.title}\n${s.content?.join('\n') || ''}\n${s.speaker_notes ? 'Notes: ' + s.speaker_notes : ''}`).join('\n\n');
                            navigator.clipboard.writeText(text);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                            toast.success('Pitch deck copied!');
                        }}
                        className="results-btn results-btn-primary"
                    >
                        {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        <span>{copied ? 'Copied!' : 'Copy All'}</span>
                    </button>

                    <button
                        onClick={() => {
                            const text = slides.map((s, i) => `Slide ${i + 1}: ${s.title}\n${s.content?.join('\n') || ''}`).join('\n\n');
                            const blob = new Blob([text], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'pitch-deck.txt';
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

            {/* Main Slide Viewer */}
            <motion.div variants={itemVariants} className="results-section">
                {/* Slide Content */}
                <div className="pitch-slide-viewer">
                    <div className="pitch-slide-content">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="pitch-slide-inner"
                        >
                            <span className="pitch-slide-number">
                                Slide {currentSlide + 1} of {slides.length}
                            </span>
                            
                            <h3 className="pitch-slide-title">
                                {slide.title}
                            </h3>
                            
                            {slide.headline && (
                                <p className="pitch-slide-headline">
                                    {slide.headline}
                                </p>
                            )}
                            
                            {slide.bullets && slide.bullets.length > 0 && (
                                <ul className="pitch-slide-bullets">
                                    {slide.bullets.map((bullet, i) => (
                                        <li key={i} className="pitch-slide-bullet">
                                            <span className="pitch-bullet-dot">•</span>
                                            <span>{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </motion.div>
                    </div>

                    {/* Navigation Arrows */}
                    <button onClick={prevSlide} className="pitch-nav-btn prev">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={nextSlide} className="pitch-nav-btn next">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                {/* Thumbnail Navigation */}
                <div className="pitch-thumbnails">
                    {slides.map((s, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`pitch-thumbnail ${idx === currentSlide ? 'active' : ''}`}
                        >
                            <span className="pitch-thumbnail-number">{idx + 1}</span>
                        </button>
                    ))}
                </div>

                {/* Speaker Notes */}
                {slide.speaker_notes && (
                    <div className="pitch-speaker-notes">
                        <h4 className="pitch-notes-label">Speaker Notes</h4>
                        <p className="pitch-notes-text">{slide.speaker_notes}</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

export default PitchDeckView;
