import { motion } from 'framer-motion';

/**
 * BadgePill - Enhanced badge component with severity colors
 */

const severityStyles = {
  critical: 'bg-(--color-error) text-white',
  high: 'bg-(--color-warning) text-white',
  medium: 'bg-(--color-info) text-white',
  low: 'bg-(--color-success) text-white',
  default: 'bg-(--color-primary) text-white',
};

const variantStyles = {
  solid: '',
  outlined: 'bg-transparent border-2',
  soft: '',
};

export function BadgePill({ 
  children, 
  severity = 'default',
  variant = 'solid',
  size = 'md',
  animated = false,
  className = '',
  ...props 
}) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  let colorClass = severityStyles[severity] || severityStyles.default;
  
  if (variant === 'outlined') {
    const outlinedColors = {
      critical: 'border-(--color-error) text-(--color-error)',
      high: 'border-(--color-warning) text-(--color-warning)',
      medium: 'border-(--color-info) text-(--color-info)',
      low: 'border-(--color-success) text-(--color-success)',
      default: 'border-(--color-primary) text-(--color-primary)',
    };
    colorClass = `${variantStyles.outlined} ${outlinedColors[severity] || outlinedColors.default}`;
  } else if (variant === 'soft') {
    const softColors = {
      critical: 'bg-(--color-error-bg) text-(--color-error)',
      high: 'bg-(--color-warning-bg) text-(--color-warning)',
      medium: 'bg-(--color-info-bg) text-(--color-info)',
      low: 'bg-(--color-success-bg) text-(--color-success)',
      default: 'bg-(--color-primary-bg) text-(--color-primary)',
    };
    colorClass = softColors[severity] || softColors.default;
  }

  const classes = `inline-flex items-center justify-center rounded-full font-semibold uppercase tracking-wide ${sizeClasses[size]} ${colorClass} ${className}`.trim();

  if (animated) {
    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={classes}
        {...props}
      >
        {children}
      </motion.span>
    );
  }

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
