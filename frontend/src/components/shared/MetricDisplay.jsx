import { motion } from 'framer-motion';

/**
 * MetricDisplay - Large metric display for key numbers
 * Perfect for TAM/SAM/SOM, revenue, users, etc.
 */

export function MetricDisplay({ 
  value, 
  label, 
  sublabel,
  icon: Icon, 
  trend,
  color = 'primary',
  size = 'md'
}) {
  const colorClasses = {
    primary: 'text-(--color-primary)',
    success: 'text-(--color-success)',
    warning: 'text-(--color-warning)',
    error: 'text-(--color-error)',
    info: 'text-(--color-info)',
  };

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
    xl: 'text-6xl',
  };

  return (
    <motion.div 
      className="text-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      {Icon && (
        <div className="flex justify-center mb-3">
          <div className={`p-3 rounded-xl bg-(--color-${color}-bg)`}>
            <Icon className={`w-6 h-6 ${colorClasses[color]}`} />
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-center gap-2 mb-2">
        <motion.span 
          className={`font-bold ${sizeClasses[size]} ${colorClasses[color]}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {value}
        </motion.span>
        
        {trend && (
          <motion.span 
            className={`text-sm font-medium px-2 py-1 rounded-full ${
              trend > 0 
                ? 'bg-(--color-success-bg) text-(--color-success)' 
                : 'bg-(--color-error-bg) text-(--color-error)'
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </motion.span>
        )}
      </div>
      
      <p className="text-sm font-semibold uppercase tracking-wide text-(--color-text-muted) mb-1">
        {label}
      </p>
      
      {sublabel && (
        <p className="text-xs text-(--color-text-tertiary)">
          {sublabel}
        </p>
      )}
    </motion.div>
  );
}
