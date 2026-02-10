import { motion } from 'framer-motion';

/**
 * ProgressBar - Animated progress bar with label
 */

export function ProgressBar({ 
  value, 
  max = 100, 
  label, 
  showPercentage = true,
  color = 'primary',
  size = 'md',
  animated = true 
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    primary: 'bg-(--color-primary)',
    success: 'bg-(--color-success)',
    warning: 'bg-(--color-warning)',
    error: 'bg-(--color-error)',
    info: 'bg-(--color-info)',
  };

  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-(--color-text-secondary)">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-(--color-text-primary)">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full ${heightClasses[size]} bg-(--color-bg-secondary) rounded-full overflow-hidden`}>
        <motion.div
          className={`${heightClasses[size]} ${colorClasses[color]} rounded-full`}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
