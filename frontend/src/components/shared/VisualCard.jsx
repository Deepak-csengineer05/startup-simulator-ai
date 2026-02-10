import { motion } from 'framer-motion';

/**
 * VisualCard - Enhanced card component with multiple variants
 * Provides visual hierarchy and polish for professional UI
 */

const variants = {
  default: 'card',
  elevated: 'card shadow-lg hover:shadow-xl transition-shadow duration-300',
  gradient: 'relative overflow-hidden rounded-xl p-6 text-white [background:var(--gradient-hero)]',
  outlined: 'rounded-xl p-6 border-2 border-(--color-primary) bg-(--color-primary-bg)',
  flat: 'rounded-xl p-6 bg-(--color-bg-secondary)',
  glow: 'card shadow-lg shadow-(--color-primary)/20 border border-(--color-primary)/30',
};

export function VisualCard({ 
  children, 
  variant = 'default', 
  className = '',
  hover = false,
  animated = true,
  ...props 
}) {
  const baseClasses = variants[variant] || variants.default;
  const hoverClasses = hover ? 'hover:-translate-y-1 hover:shadow-xl transition-all duration-300' : '';
  const combinedClasses = `${baseClasses} ${hoverClasses} ${className}`.trim();

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={combinedClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
}
