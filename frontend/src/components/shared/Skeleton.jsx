import { motion } from 'framer-motion';

/**
 * Skeleton Loader Components
 * Professional loading skeletons that match actual content structure
 */

// Base Skeleton primitive
export function Skeleton({ width = '100%', height = '20px', className = '', style = {} }) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                width,
                height,
                borderRadius: 'var(--radius-md)',
                ...style,
            }}
            aria-hidden="true"
        />
    );
}

// Card Skeleton - matches DashboardCard structure
export function CardSkeleton() {
    return (
        <div
            style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-6)',
            }}
        >
            {/* Icon skeleton */}
            <Skeleton
                width="48px"
                height="48px"
                style={{ marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}
            />

            {/* Title skeleton */}
            <Skeleton
                width="70%"
                height="24px"
                style={{ marginBottom: 'var(--space-2)' }}
            />

            {/* Description skeletons */}
            <Skeleton
                width="100%"
                height="16px"
                style={{ marginBottom: 'var(--space-2)' }}
            />
            <Skeleton
                width="85%"
                height="16px"
                style={{ marginBottom: 'var(--space-6)' }}
            />

            {/* Action skeleton */}
            <Skeleton
                width="120px"
                height="16px"
            />
        </div>
    );
}

// Text skeleton - multi-line text loading
export function TextSkeleton({ lines = 3, gap = 'var(--space-2)' }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap }}>
            {Array.from({ length: lines }).map((_, index) => (
                <Skeleton
                    key={index}
                    height="16px"
                    width={index === lines - 1 ? '75%' : '100%'}
                />
            ))}
        </div>
    );
}

// Avatar skeleton - circular profile picture
export function AvatarSkeleton({ size = '40px' }) {
    return (
        <Skeleton
            width={size}
            height={size}
            style={{ borderRadius: 'var(--radius-full)' }}
        />
    );
}

// Button skeleton
export function ButtonSkeleton({ width = '120px', variant = 'primary' }) {
    return (
        <Skeleton
            width={width}
            height="40px"
            style={{ borderRadius: 'var(--radius-lg)' }}
        />
    );
}

// List item skeleton
export function ListItemSkeleton() {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
                background: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
            }}
        >
            <AvatarSkeleton />
            <div style={{ flex: 1 }}>
                <Skeleton width="60%" height="18px" style={{ marginBottom: 'var(--space-2)' }} />
                <Skeleton width="40%" height="14px" />
            </div>
        </div>
    );
}

// Dashboard Grid Skeleton
export function DashboardGridSkeleton({ count = 8 }) {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 'var(--space-6)',
            }}
        >
            {Array.from({ length: count }).map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <CardSkeleton />
                </motion.div>
            ))}
        </div>
    );
}

// Content Skeleton - for article/document loading
export function ContentSkeleton() {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <Skeleton width="80%" height="36px" style={{ marginBottom: 'var(--space-4)' }} />
            <Skeleton width="40%" height="20px" style={{ marginBottom: 'var(--space-8)' }} />

            {/* Content paragraphs */}
            <TextSkeleton lines={4} gap="var(--space-3)" />
            <div style={{ height: 'var(--space-6)' }} />
            <TextSkeleton lines={5} gap="var(--space-3)" />
            <div style={{ height: 'var(--space-6)' }} />
            <TextSkeleton lines={3} gap="var(--space-3)" />
        </div>
    );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }) {
    return (
        <div
            style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
            }}
        >
            {/* Table Header */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: 'var(--space-4)',
                    padding: 'var(--space-4)',
                    background: 'var(--color-bg-secondary)',
                    borderBottom: '1px solid var(--color-border)',
                }}
            >
                {Array.from({ length: columns }).map((_, index) => (
                    <Skeleton key={index} width="80px" height="16px" />
                ))}
            </div>

            {/* Table Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${columns}, 1fr)`,
                        gap: 'var(--space-4)',
                        padding: 'var(--space-4)',
                        borderBottom: rowIndex < rows - 1 ? '1px solid var(--color-border)' : 'none',
                    }}
                >
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton
                            key={colIndex}
                            width={colIndex === 0 ? '120px' : '90%'}
                            height="16px"
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export default Skeleton;
