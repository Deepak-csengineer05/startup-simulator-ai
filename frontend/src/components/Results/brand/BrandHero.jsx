import { Copy, Download, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import '../ResultsStyles.css';

export default function BrandHero({ data, copyAll, exportTxt }) {
  return (
    <div className="results-hero">
      <motion.div
        className="results-hero-icon"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        <Sparkles className="w-10 h-10 text-white" />
      </motion.div>

      <h1 className="results-hero-title">
        {data.name_options?.[0] || 'Your Brand'}
      </h1>

      {data.taglines?.[0] && (
        <p className="results-hero-subtitle" style={{ fontStyle: 'italic' }}>
          "{data.taglines[0]}"
        </p>
      )}

      <div className="results-hero-actions">
        <button onClick={copyAll} className="results-btn results-btn-primary">
          <Copy size={18}/> Copy All
        </button>

        <button onClick={exportTxt} className="results-btn results-btn-secondary">
          <Download size={18}/> Export
        </button>
      </div>
    </div>
  );
}
