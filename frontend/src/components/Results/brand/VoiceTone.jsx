import { MessageSquare } from 'lucide-react';
import '../ResultsStyles.css';

export default function VoiceTone({ tone }) {
  return (
    <div className="results-section">
      <div className="results-section-header">
        <div className="results-section-icon">
          <MessageSquare />
        </div>
        <div>
          <h2 className="results-section-title">Voice & Tone</h2>
          <p className="results-section-subtitle">How your brand speaks and connects</p>
        </div>
      </div>

      <div className="voice-tone-content">
        <p className="voice-tone-text">{tone}</p>
      </div>
    </div>
  );
}
