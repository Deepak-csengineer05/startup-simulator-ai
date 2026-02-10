import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle, Loader2, Lock } from 'lucide-react';

/**
 * Premium DashboardCard Component
 * Rebuilt with world-class design standards
 * - Multi-layer shadows for depth
 * - Icon micro-animations
 * - Refined hover states with gradient border effect
 * - Proper accessibility with ARIA labels and keyboard navigation
 * - Uses strict design tokens (no arbitrary values)
 */

function DashboardCard({ icon: Icon, title, description, onClick, disabled = false, onGenerate = null, isGenerating = false }) {
    return (
        <motion.div
            whileHover={!disabled && !isGenerating ? { y: -8 } : {}}
            whileTap={!disabled && !isGenerating ? { scale: 0.98 } : {}}
            className={`
                dashboard-card group relative overflow-hidden
                transition-all duration-300
                ${disabled || isGenerating
                    ? 'cursor-default'
                    : 'cursor-pointer'
                }
            `}
            onClick={!disabled && !isGenerating ? onClick : undefined}
            role={!disabled ? "button" : undefined}
            tabIndex={!disabled ? 0 : -1}
            data-disabled={disabled || isGenerating}
            onKeyDown={!disabled && !isGenerating ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                }
            } : undefined}
            aria-label={`${title} module${disabled ? ' (not generated)' : ''}`}
            aria-disabled={disabled}
            onFocus={(e) => {
                if (e.target.matches(':focus-visible')) {
                    e.target.style.boxShadow = 'var(--focus-ring)';
                }
            }}
            onBlur={(e) => {
                e.target.style.boxShadow = '';
            }}
        >
            {/* Gradient border effect on hover */}
            {!disabled && !isGenerating && (
                <div
                    className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                        background: 'var(--gradient-primary)',
                        padding: '1px',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                    }}
                />
            )}

            {/* Premium shadow on hover */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10"
                style={{
                    boxShadow: 'var(--shadow-xl), var(--shadow-glow-sm)',
                    borderRadius: 'inherit',
                }}
            />

            {/* Background gradient subtle effect */}
            {!disabled && !isGenerating && (
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle at top right, var(--color-primary-light) 0%, transparent 50%)',
                        borderRadius: 'inherit',
                    }}
                />
            )}

            <div className="relative z-10">
                {/* Icon Container */}
                <motion.div
                    className="flex items-center justify-center"
                    style={{
                        width: 'clamp(40px, 10vw, 48px)',
                        height: 'clamp(40px, 10vw, 48px)',
                        borderRadius: 'var(--radius-lg)',
                        background: disabled
                            ? 'var(--color-bg-tertiary)'
                            : 'var(--color-primary-bg)',
                        marginBottom: 'clamp(12px, 3vw, 16px)',
                        transition: 'all var(--transition-base)',
                    }}
                    whileHover={!disabled ? { scale: 1.1, rotate: 5 } : {}}
                >
                    {disabled ? (
                        <Lock
                            style={{
                                width: 'clamp(20px, 5vw, 24px)',
                                height: 'clamp(20px, 5vw, 24px)',
                                color: 'var(--color-text-muted)'
                            }}
                        />
                    ) : (
                        <motion.div
                            className="group-hover:scale-110 transition-transform duration-300"
                        >
                            <Icon
                                style={{
                                    width: 'clamp(20px, 5vw, 24px)',
                                    height: 'clamp(20px, 5vw, 24px)',
                                    color: 'var(--color-primary)',
                                    transition: 'color var(--transition-base)',
                                }}
                                className="group-hover:drop-shadow-lg"
                            />
                        </motion.div>
                    )}
                </motion.div>

                {/* Content */}
                <h3
                    className="font-semibold mb-2 transition-colors duration-300"
                    style={{
                        fontSize: 'var(--font-size-h4)',
                        lineHeight: 'var(--line-height-snug)',
                        color: 'var(--color-text-primary)',
                    }}
                >
                    {title}
                </h3>

                <p
                    style={{
                        fontSize: 'var(--font-size-body-sm)',
                        lineHeight: 'var(--line-height-relaxed)',
                        color: 'var(--color-text-secondary)',
                        marginBottom: 'var(--space-6)',
                    }}
                >
                    {description}
                </p>

                {/* Action Arrow */}
                {!disabled && !isGenerating && (
                    <motion.div
                        className="flex items-center font-semibold group-hover:translate-x-1 transition-transform duration-300"
                        style={{
                            fontSize: 'var(--font-size-body-sm)',
                            color: 'var(--color-primary)',
                            gap: 'var(--space-2)',
                        }}
                    >
                        <span>Open Module</span>
                        <ArrowRight style={{ width: '16px', height: '16px' }} />
                    </motion.div>
                )}

                {isGenerating && (
                    <div
                        className="flex items-center font-medium"
                        style={{
                            fontSize: 'var(--font-size-body-sm)',
                            color: 'var(--color-warning)',
                            gap: 'var(--space-2)',
                        }}
                    >
                        <span>Generating...</span>
                    </div>
                )}

                {disabled && onGenerate && !isGenerating && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onGenerate?.();
                        }}
                        className="flex items-center font-semibold hover:translate-x-1 transition-all duration-300"
                        style={{
                            fontSize: 'var(--font-size-body-sm)',
                            color: 'var(--color-primary)',
                            gap: 'var(--space-2)',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                        }}
                    >
                        <span>Generate Module</span>
                        <ArrowRight style={{ width: '16px', height: '16px' }} />
                    </button>
                )}

                {disabled && !onGenerate && !isGenerating && (
                    <div
                        className="flex items-center font-medium"
                        style={{
                            fontSize: 'var(--font-size-body-sm)',
                            color: 'var(--color-text-muted)',
                            gap: 'var(--space-2)',
                        }}
                    >
                        <span>Not generated</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default DashboardCard;
