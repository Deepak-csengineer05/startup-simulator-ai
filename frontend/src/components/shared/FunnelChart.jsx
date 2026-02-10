import { motion } from 'framer-motion';
import { TrendingDown } from 'lucide-react';

/**
 * FunnelChart - Visual funnel for TAM/SAM/SOM display
 */

export function FunnelChart({ stages }) {
  if (!stages || stages.length === 0) return null;

  return (
    <div className="relative max-w-2xl mx-auto py-8">
      {stages.map((stage, index) => {
        const widthPercentage = 100 - (index * 20);
        const isLast = index === stages.length - 1;

        return (
          <div key={index} className="mb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="relative"
            >
              {/* Funnel Stage */}
              <div 
                className="mx-auto rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg"
                style={{
                  width: `${widthPercentage}%`,
                  background: `linear-gradient(135deg, ${stage.color || '#667eea'} 0%, ${stage.colorDark || '#764ba2'} 100%)`,
                }}
              >
                <div className="text-white">
                  <p className="text-xs uppercase tracking-wide font-semibold opacity-90 mb-1">
                    {stage.label}
                  </p>
                  <p className="text-3xl font-bold mb-1">
                    {stage.value}
                  </p>
                  {stage.description && (
                    <p className="text-sm opacity-80">
                      {stage.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Arrow Connector */}
              {!isLast && (
                <motion.div 
                  className="flex items-center justify-center my-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.2 + 0.3 }}
                >
                  <div className="flex items-center gap-2 text-(--color-text-muted)">
                    <TrendingDown className="w-5 h-5" />
                    {stage.conversionRate && (
                      <span className="text-sm font-medium">
                        {stage.conversionRate}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
