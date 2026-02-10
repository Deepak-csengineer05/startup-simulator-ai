import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import '../ResultsStyles.css';

export default function Taglines({ taglines = [] }) {
  return (
    <div className="results-section">
      <div className="results-section-header">
        <div className="results-section-icon">
          <Quote />
        </div>
        <div>
          <h2 className="results-section-title">Brand Taglines</h2>
          <p className="results-section-subtitle">Memorable phrases that capture your essence</p>
        </div>
      </div>

      <div className="tagline-list">
        {taglines.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ x: 4 }}
            className="tagline-item"
          >
            <Quote className="tagline-quote-icon" />
            <p className="tagline-text">"{t}"</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
