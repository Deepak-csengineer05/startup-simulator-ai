import { motion } from 'framer-motion';

/**
 * EmptyState Component
 * Professional empty state component for when there's no data
 */

export default function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    variant = 'default', // default, minimal, illustration
    className = '',
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`text-center ${className}`}
            style={{
                maxWidth: '480px',
                margin: '0 auto',
                padding: 'var(--space-12)',
            }}
        >
            {/* Icon/Illustration */}
            {Icon && (
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: variant === 'minimal' ? '64px' : '128px',
                        height: variant === 'minimal' ? '64px' : '128px',
                        marginBottom: 'var(--space-6)',
                        borderRadius: 'var(--radius-full)',
                        background: variant === 'minimal'
                            ? 'var(--color-bg-secondary)'
                            : 'var(--color-primary-bg)',
                        position: 'relative',
                    }}
                >
                    {/* Subtle glow effect for default variant */}
                    {variant === 'default' && (
                        <div
                            style={{
                                position: 'absolute',
                                inset: '-20px',
                                background: 'radial-gradient(circle, var(--color-primary-light) 0%, transparent 70%)',
                                opacity: 0.5,
                                animation: 'pulse 3s ease-in-out infinite',
                            }}
                        />
                    )}

                    <Icon
                        style={{
                            width: variant === 'minimal' ? '32px' : '64px',
                            height: variant === 'minimal' ? '32px' : '64px',
                            color: variant === 'minimal'
                                ? 'var(--color-text-muted)'
                                : 'var(--color-primary)',
                        }}
                    />
                </motion.div>
            )}

            {/* Title */}
            <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                    fontSize: variant === 'minimal' ? 'var(--font-size-h4)' : 'var(--font-size-h3)',
                    fontWeight: 'var(--font-weight-bold)',
                    lineHeight: 'var(--line-height-tight)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-3)',
                }}
            >
                {title}
            </motion.h3>

            {/* Description */}
            {description && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        fontSize: 'var(--font-size-body)',
                        lineHeight: 'var(--line-height-relaxed)',
                        color: 'var(--color-text-secondary)',
                        marginBottom: actionLabel ? 'var(--space-6)' : 0,
                    }}
                >
                    {description}
                </motion.p>
            )}

            {/* Action Button */}
            {actionLabel && onAction && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={onAction}
                    className="btn btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {actionLabel}
                </motion.button>
            )}
        </motion.div>
    );
}

// Pre-configured empty state variants
EmptyState.NoData = function NoDataEmpty({ actionLabel, onAction }) {
    return (
        <EmptyState
            icon={({ style }) => (
                <svg style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )}
            title="No data yet"
            description="Get started by creating your first item."
            actionLabel={actionLabel}
            onAction={onAction}
        />
    );
};

EmptyState.NoResults = function NoResultsEmpty({ searchTerm }) {
    return (
        <EmptyState
            icon={({ style }) => (
                <svg style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            )}
            title="No results found"
            description={searchTerm ? `No results for "${searchTerm}". Try a different search.` : "Try adjusting your filters or search terms."}
            variant="minimal"
        />
    );
};

EmptyState.Error = function ErrorEmpty({ onRetry }) {
    return (
        <EmptyState
            icon={({ style }) => (
                <svg style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )}
            title="Something went wrong"
            description="We encountered an error loading this content. Please try again."
            actionLabel="Retry"
            onAction={onRetry}
        />
    );
};
