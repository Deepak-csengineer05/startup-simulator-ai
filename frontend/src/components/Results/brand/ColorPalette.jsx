import { Copy, Check, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import '../ResultsStyles.css';

export default function ColorPalette({ colors = [], copiedColor, onCopy }) {
  return (
    <div className="results-section">
      <div className="results-section-header">
        <div className="results-section-icon">
          <Palette />
        </div>
        <div>
          <h2 className="results-section-title">Brand Color Palette</h2>
          <p className="results-section-subtitle">Click any color to copy hex code</p>
        </div>
      </div>

      <div className="color-palette-grid">
        {colors.map((c, i) => {
          const hex = typeof c === 'string' ? c : c.hex;
          const isCopied = copiedColor === hex;

          return (
            <motion.button
              key={i}
              onClick={() => onCopy(hex)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="color-swatch"
            >
              <div
                className="color-swatch-color"
                style={{ backgroundColor: hex }}
              />
              <div className="color-swatch-info">
                <p className="color-swatch-hex">{hex}</p>
                {isCopied && (
                  <span className="color-swatch-copied">
                    <Check className="w-3 h-3" /> Copied!
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
