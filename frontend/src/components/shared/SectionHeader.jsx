import { motion } from 'framer-motion';

/**
 * SectionHeader - Consistent section header with icon and optional actions
 */

export function SectionHeader({ 
  icon: Icon, 
  title, 
  subtitle,
  actions,
  iconColor = 'primary',
  centered = false 
}) {
  const colorClasses = {
    primary: 'bg-(--color-primary-bg) text-(--color-primary)',
    success: 'bg-(--color-success-bg) text-(--color-success)',
    warning: 'bg-(--color-warning-bg) text-(--color-warning)',
    error: 'bg-(--color-error-bg) text-(--color-error)',
    info: 'bg-(--color-info-bg) text-(--color-info)',
  };

  const alignment = centered ? 'text-center items-center' : 'text-left items-start';

  return (
    <motion.div 
      className={`mb-6 ${centered ? 'flex flex-col items-center' : ''}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={`flex ${centered ? 'flex-col' : 'flex-row'} ${centered ? 'items-center' : 'items-center justify-between'} gap-4 mb-2`}>
        <div className={`flex ${alignment} gap-3`}>
          {Icon && (
            <div className={`p-2 rounded-lg ${colorClasses[iconColor] || colorClasses.primary}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="h4 mb-1">{title}</h3>
            {subtitle && (
              <p className="text-sm text-(--color-text-secondary)">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
}
