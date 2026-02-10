import { motion } from 'framer-motion';
import { Code2, Eye, Globe, Copy, Download, RefreshCw } from 'lucide-react';
import { CodeBlock } from '../shared/CodeBlock';
import sessionApi from '../../services/api';
import './ResultsStyles.css';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

function LandingCopyView({ data }) {
    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Code2 className="w-12 h-12 text-(--color-text-muted) mb-4" />
                <p className="text-(--color-text-secondary) text-lg font-medium mb-2">
                    No landing content available
                </p>
                <p className="text-(--color-text-tertiary) text-sm">
                    Generate a startup concept to see landing page code
                </p>
            </div>
        );
    }

    const isStructured = data.hero && data.hero.headline;

    const heroSection = isStructured 
        ? `<!-- Hero Section -->
<section class="hero-section">
  <h1>${data.hero.headline}</h1>
  <p class="subtitle">${data.hero.subheadline}</p>
  <button class="cta-button">${data.hero.cta_text}</button>
</section>`
        : `<!-- Hero Section -->
<section class="hero-section">
  <h1>${data.hero_headline || 'Your Headline'}</h1>
  <p class="subtitle">${data.hero_subtitle || 'Subheadline'}</p>
  <button class="cta-button">${data.primary_cta || 'Get Started'}</button>
</section>`;

    const featuresSection = `<!-- Features Section -->
<section class="features-section">
  <h2>Features</h2>
  <div class="features-grid">
${(isStructured ? data.features : data.feature_blocks || [])?.map(f => `    <div class="feature-card">
      <h3>${f.title}</h3>
      <p>${f.description}</p>
    </div>`).join('\n')}
  </div>
</section>`;

    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isStructured ? data.hero?.headline : data.hero_headline || 'Landing Page'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      line-height: 1.6; 
      color: #333; 
    }
    .hero-section { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; 
      padding: 100px 20px; 
      text-align: center; 
    }
    .hero-section h1 { 
      font-size: 3rem; 
      margin-bottom: 1rem; 
      font-weight: 800; 
    }
    .hero-section .subtitle { 
      font-size: 1.25rem; 
      margin-bottom: 2rem; 
      opacity: 0.9; 
    }
    .cta-button { 
      background: white; 
      color: #667eea; 
      padding: 1rem 2rem; 
      border: none; 
      border-radius: 8px; 
      font-size: 1rem; 
      font-weight: 600; 
      cursor: pointer; 
      transition: transform 0.2s; 
    }
    .cta-button:hover { transform: scale(1.05); }
    .features-section { 
      padding: 80px 20px; 
      max-width: 1200px; 
      margin: 0 auto; 
    }
    .features-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
      gap: 2rem; 
      margin-top: 2rem; 
    }
    .feature-card { 
      background: #f7fafc; 
      padding: 2rem; 
      border-radius: 12px; 
      text-align: center; 
    }
    h2 { 
      font-size: 2.5rem; 
      text-align: center; 
      margin-bottom: 1rem; 
      font-weight: 800; 
    }
    h3 { 
      font-size: 1.5rem; 
      margin-bottom: 0.5rem; 
      font-weight: 700; 
    }
  </style>
</head>
<body>
${heroSection}

${featuresSection}
</body>
</html>`;

    const handleCopyAll = () => {
        navigator.clipboard.writeText(fullHTML);
    };

    const handleExport = () => {
        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'landing-page.html';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleRegenerate = async () => {
        try {
            await sessionApi.regenerateSection('landing');
            window.location.reload();
        } catch (error) {
            console.error('Failed to regenerate:', error);
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="results-container"
        >
            {/* Hero */}
            <motion.div variants={itemVariants} className="results-hero">
                <motion.div
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="results-icon"
                >
                    <Globe size={48} />
                </motion.div>
                <h1 className="results-title">Landing Page Code</h1>
                <p className="results-subtitle">Production-ready HTML & CSS for your startup</p>
                <div className="results-actions">
                    <button onClick={handleCopyAll} className="results-btn results-btn-primary">
                        <Copy size={18} />
                        Copy All Code
                    </button>
                    <button onClick={handleExport} className="results-btn results-btn-secondary">
                        <Download size={18} />
                        Export HTML
                    </button>
                    <button onClick={handleRegenerate} className="results-btn results-btn-outline">
                        <RefreshCw size={18} />
                        Regenerate
                    </button>
                </div>
            </motion.div>

            {/* Visual Preview */}
            <motion.div variants={itemVariants} className="results-section">
                <div className="results-section-header">
                    <div className="results-section-icon" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                        <Eye size={24} style={{ color: 'rgb(59, 130, 246)' }} />
                    </div>
                    <div>
                        <h2 className="results-section-title">Visual Preview</h2>
                        <p className="results-section-subtitle">See your landing page in action</p>
                    </div>
                </div>

                <div className="landing-preview">
                    <div className="landing-preview-hero">
                        <h1 className="landing-preview-headline">
                            {isStructured ? data.hero?.headline : data.hero_headline || 'Your Headline'}
                        </h1>
                        <p className="landing-preview-subheadline">
                            {isStructured ? data.hero?.subheadline : data.hero_subtitle || 'Your subheadline here'}
                        </p>
                        <button className="landing-preview-cta">
                            {isStructured ? data.hero?.cta_text : data.primary_cta || 'Get Started'}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Code Sections */}
            <motion.div variants={itemVariants} className="results-section">
                <div className="results-section-header">
                    <div className="results-section-icon" style={{ background: 'rgba(0, 210, 255, 0.2)' }}>
                        <Code2 size={24} style={{ color: '#00D2FF' }} />
                    </div>
                    <div>
                        <h2 className="results-section-title">HTML Code</h2>
                        <p className="results-section-subtitle">Copy and customize for your needs</p>
                    </div>
                </div>

                <div className="landing-code-sections">
                    <div className="landing-code-block">
                        <div className="landing-code-header">
                            <span className="landing-code-badge" style={{ background: 'rgba(0, 210, 255, 0.2)', color: '#00D2FF' }}>
                                Hero Section
                            </span>
                            <button 
                                onClick={() => navigator.clipboard.writeText(heroSection)}
                                className="landing-copy-btn"
                            >
                                <Copy size={16} />
                                Copy
                            </button>
                        </div>
                        <CodeBlock 
                            code={heroSection}
                            language="html"
                            title="Hero HTML"
                        />
                    </div>

                    <div className="landing-code-block">
                        <div className="landing-code-header">
                            <span className="landing-code-badge" style={{ background: 'rgba(142, 45, 226, 0.2)', color: 'rgb(142, 45, 226)' }}>
                                Features Section
                            </span>
                            <button 
                                onClick={() => navigator.clipboard.writeText(featuresSection)}
                                className="landing-copy-btn"
                            >
                                <Copy size={16} />
                                Copy
                            </button>
                        </div>
                        <CodeBlock 
                            code={featuresSection}
                            language="html"
                            title="Features HTML"
                        />
                    </div>

                    <div className="landing-code-block">
                        <div className="landing-code-header">
                            <span className="landing-code-badge" style={{ background: 'rgba(34, 197, 94, 0.2)', color: 'rgb(34, 197, 94)' }}>
                                Complete Page
                            </span>
                            <button 
                                onClick={() => navigator.clipboard.writeText(fullHTML)}
                                className="landing-copy-btn"
                            >
                                <Copy size={16} />
                                Copy
                            </button>
                        </div>
                        <CodeBlock 
                            code={fullHTML}
                            language="html"
                            title="Full Landing Page"
                            maxHeight="500px"
                        />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default LandingCopyView;
