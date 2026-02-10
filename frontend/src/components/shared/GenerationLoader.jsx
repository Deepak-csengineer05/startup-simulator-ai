import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Rocket, Zap } from 'lucide-react';
import { DashboardGridSkeleton } from './Skeleton';

/**
 * Enhanced Loading Component with Real Elapsed Time and Dynamic Messages
 * Tracks actual backend generation time, not a fake countdown
 */

const LOADING_MESSAGES = [
    { time: 0, message: "Started creating your startup packages", icon: Rocket },
    { time: 10, message: "Analyzing your concept...", icon: Sparkles },
    { time: 15, message: "Are you curious to see the ideas?", icon: Zap },
    { time: 20, message: "Building your brand identity...", icon: Rocket },
    { time: 30, message: "Yes! Almost halfway there", icon: Sparkles },
    { time: 40, message: "Crafting market analysis...", icon: Zap },
    { time: 50, message: "Yes, it's nearly ready to see the modules!", icon: Rocket },
    { time: 60, message: "Just a bit longer...", icon: Sparkles },
    { time: 70, message: "Finalizing details...", icon: Zap },
    { time: 80, message: "Almost complete!", icon: Rocket },
];

function GenerationLoader({ elapsedTime = 0 }) {
    const [currentMessage, setCurrentMessage] = useState(LOADING_MESSAGES[0]);

    useEffect(() => {
        // Update message based on elapsed time
        const message = [...LOADING_MESSAGES]
            .reverse()
            .find(msg => elapsedTime >= msg.time) || LOADING_MESSAGES[0];

        if (message.message !== currentMessage.message) {
            setCurrentMessage(message);
        }
    }, [elapsedTime, currentMessage.message]);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate a rough progress (capped at 95% until complete)
    const estimatedTime = 60; // Estimate, but will continue beyond if needed
    const progress = Math.min((elapsedTime / estimatedTime) * 100, 95);

    const MessageIcon = currentMessage.icon;

    return (
        <div className="h-full overflow-y-auto p-8 relative">
            {/* Floating Timer in Top-Right Corner */}
            <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                className="fixed top-20 right-6 z-50"
                style={{
                    background: 'var(--color-bg-card)',
                    border: '2px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-4)',
                    boxShadow: 'var(--shadow-xl)',
                    minWidth: '280px',
                }}
            >
                {/* Timer Circle */}
                <div className="flex items-center gap-4 mb-3">
                    <div
                        style={{
                            position: 'relative',
                            width: '60px',
                            height: '60px',
                        }}
                    >
                        {/* Circular Progress */}
                        <svg
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                transform: 'rotate(-90deg)',
                            }}
                        >
                            <circle
                                cx="30"
                                cy="30"
                                r="26"
                                fill="none"
                                stroke="var(--color-bg-tertiary)"
                                strokeWidth="3"
                            />
                            <motion.circle
                                cx="30"
                                cy="30"
                                r="26"
                                fill="none"
                                stroke="var(--color-primary)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                animate={{
                                    strokeDashoffset: 163.36 - (163.36 * progress) / 100,
                                }}
                                style={{
                                    strokeDasharray: 163.36,
                                    transition: 'stroke-dashoffset 0.5s ease',
                                }}
                            />
                        </svg>

                        {/* Timer Display - Shows ELAPSED time */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                fontSize: 'var(--font-size-body-sm)',
                                fontWeight: 'var(--font-weight-bold)',
                                color: 'var(--color-text-primary)',
                                fontFamily: 'monospace',
                            }}
                        >
                            {formatTime(elapsedTime)}
                        </div>
                    </div>

                    {/* Progress Info */}
                    <div style={{ flex: 1 }}>
                        <div
                            style={{
                                fontSize: 'var(--font-size-body-sm)',
                                fontWeight: 'var(--font-weight-semibold)',
                                color: 'var(--color-text-primary)',
                                marginBottom: 'var(--space-1)',
                            }}
                        >
                            Generating...
                        </div>
                        <div
                            style={{
                                fontSize: 'var(--font-size-caption)',
                                color: 'var(--color-text-muted)',
                            }}
                        >
                            {Math.round(progress)}% complete
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div
                    style={{
                        width: '100%',
                        height: '4px',
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                        marginBottom: 'var(--space-3)',
                    }}
                >
                    <motion.div
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        style={{
                            height: '100%',
                            background: 'var(--gradient-primary)',
                            borderRadius: 'var(--radius-full)',
                        }}
                    />
                </div>

                {/* Dynamic Message */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentMessage.message}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-start gap-2"
                    >
                        <motion.div
                            animate={{
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
                            <MessageIcon
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    color: 'var(--color-primary)',
                                    flexShrink: 0,
                                }}
                            />
                        </motion.div>
                        <p
                            style={{
                                fontSize: 'var(--font-size-body-sm)',
                                color: 'var(--color-text-secondary)',
                                lineHeight: 'var(--line-height-snug)',
                                margin: 0,
                            }}
                        >
                            {currentMessage.message}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Skeleton Grid Below */}
            <div className="pt-8">
                <DashboardGridSkeleton count={8} />
            </div>
        </div>
    );
}

export default GenerationLoader;
