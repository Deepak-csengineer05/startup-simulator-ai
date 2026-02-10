import { Type } from 'lucide-react';
import { motion } from 'framer-motion';
import '../ResultsStyles.css';

export default function BrandNames({ names = [] }) {
  return (
    <div className="results-section">
      <div className="results-section-header">
        <div className="results-section-icon">
          <Type />
        </div>
        <div>
          <h2 className="results-section-title">Brand Name Options</h2>
          <p className="results-section-subtitle">AI-generated name variations for your startup</p>
        </div>
      </div>

      <div className="brand-names-grid">
        {names.map((name, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`brand-name-option ${i === 0 ? 'primary' : 'secondary'}`}
          >
            {i === 0 && <span className="brand-name-badge">Primary</span>}
            <p className="brand-name-text">{name}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
