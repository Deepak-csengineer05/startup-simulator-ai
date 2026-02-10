import { motion } from 'framer-motion';
import { Code, Copy, Download, Eye, RefreshCw, Rocket, Shield, Zap, Users, TrendingUp, Check, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { useState } from 'react';
import { sessionApi } from '../../services/api';
import './ResultsStyles.css';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const iconMap = {
    rocket: Rocket,
    shield: Shield,
    zap: Zap,
    users: Users,
    chart: TrendingUp,
    check: Check
};

function LandingPagePreviewStructured({ data: initialData, sessionId, onRegenerate }) {
    const [data, setData] = useState(initialData);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    const handleRegenerate = async () => {
        setIsRegenerating(true);
        try {
            const result = await sessionApi.regenerate(sessionId, 'landing_content');
            setData(result.data);
            if (onRegenerate) onRegenerate(result.data);
        } catch (error) {
            console.error('Failed to regenerate:', error);
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleDownloadHTML = () => {
        // Generate HTML from structured data
        const html = generateHTMLFromData(data);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'landing-page.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Check if data has new structured format or old HTML format
    const isStructured = data.hero && !data.html;

    if (!isStructured) {
        // Fallback for old format - show message
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Eye className="w-12 h-12 text-() mb-4" />
                <p className="text-() text-lg font-medium mb-2">
                    Preview not available
                </p>
                <p className="text-() text-sm mb-4">
                    Please regenerate to see the new landing page format
                </p>
                <button onClick={handleRegenerate} className="btn btn-secondary inline-flex items-center gap-2" disabled={isRegenerating} aria-label="Regenerate landing page content">
                    <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                    <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
                </button>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="results-container"
        >
            {/* Hero */}
            <motion.div className="results-hero">
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
                <h1 className="results-title">Landing Page Preview</h1>
                <p className="results-subtitle">Interactive preview of your startup's landing page</p>
                <div className="results-actions">
                    <button
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="results-btn results-btn-primary"
                    >
                        <RefreshCw className={isRegenerating ? 'animate-spin' : ''} size={18} />
                        {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                    </button>
                    <button onClick={handleDownloadHTML} className="results-btn results-btn-secondary">
                        <Download size={18} />
                        Export HTML
                    </button>
                </div>
            </motion.div>

            {/* Landing Page Content */}
            <div className="landing-preview-wrapper">
                {/* Hero Section */}
                <section className="landing-hero-section">
                    <div className="landing-hero-content">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="landing-hero-headline"
                        >
                            {data.hero.headline}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="landing-hero-subheadline"
                        >
                            {data.hero.subheadline}
                        </motion.p>
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="landing-hero-cta"
                        >
                            {data.hero.cta_text}
                        </motion.button>
                    </div>
                </section>

                {/* Features Section */}
                <section className="landing-features-section">
                    <div className="landing-section-container">
                        <h2 className="landing-section-title">Features</h2>
                        <div className="landing-features-grid">
                            {data.features?.map((feature, idx) => {
                                const Icon = iconMap[feature.icon] || Zap;
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="landing-feature-card"
                                    >
                                        <div className="landing-feature-icon">
                                            <Icon size={28} />
                                        </div>
                                        <h3 className="landing-feature-title">
                                            {feature.title}
                                        </h3>
                                        <p className="landing-feature-description">
                                            {feature.description}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="landing-pricing-section">
                    <div className="landing-section-container">
                        <h2 className="landing-section-title">Pricing</h2>
                        <div className="landing-pricing-grid">
                            {data.pricing?.tiers?.map((tier, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`landing-pricing-card ${tier.highlighted ? 'highlighted' : ''}`}
                                >
                                    {tier.highlighted && (
                                        <div className="landing-pricing-badge">Most Popular</div>
                                    )}
                                    <h3 className="landing-pricing-name">{tier.name}</h3>
                                    <div className="landing-pricing-price">
                                        <span className="landing-price-amount">{tier.price}</span>
                                        <span className="landing-price-period">/{tier.period}</span>
                                    </div>
                                    <ul className="landing-pricing-features">
                                        {tier.features.map((feature, fidx) => (
                                            <li key={fidx} className="landing-pricing-feature-item">
                                                <Check size={18} />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button className="landing-pricing-cta">
                                        {tier.cta}
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="landing-faq-section">
                    <div className="landing-section-container-narrow">
                        <h2 className="landing-section-title">Frequently Asked Questions</h2>
                        <div className="landing-faq-list">
                            {data.faq?.map((item, idx) => (
                                <div key={idx} className="landing-faq-item">
                                    <button
                                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                                        className="landing-faq-question"
                                    >
                                        <span>{item.question}</span>
                                        {openFaqIndex === idx ? (
                                            <ChevronUp size={20} />
                                        ) : (
                                            <ChevronDown size={20} />
                                        )}
                                    </button>
                                    {openFaqIndex === idx && (
                                        <div className="landing-faq-answer">
                                            {item.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="landing-final-cta">
                    <div className="landing-section-container">
                        <h2 className="landing-final-headline">
                            {data.final_cta.headline}
                        </h2>
                        <p className="landing-final-subtext">
                            {data.final_cta.subtext}
                        </p>
                        <button className="landing-final-button">
                            {data.final_cta.button_text}
                        </button>
                    </div>
                </section>
            </div>
        </motion.div>
    );
}

// Helper function to generate HTML from structured data
function generateHTMLFromStructuredData(data) {
  if (!data.hero || !data.features) {
    return '<h1>Invalid data format</h1>';
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.hero.headline}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-linear-to-br from-blue-600 to-purple-700 text-white">
        <div class="container mx-auto px-6 py-24 text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                ${data.hero.headline}
            </h1>
            <p class="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                ${data.hero.subheadline}
            </p>
            <button class="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                ${data.hero.cta_text}
            </button>
        </div>
    </section>
    
    <!-- Features Section -->
    <section class="py-16 bg-white">
        <div class="container mx-auto px-6">
            <h2 class="text-3xl font-bold text-center mb-12">Features</h2>
            <div class="grid md:grid-cols-${data.features.length > 3 ? '4' : '3'} gap-8">
                ${data.features.map(f => `
                <div class="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                    <div class="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                        <span class="text-white text-xl">${f.icon === 'rocket' ? '🚀' : 
                            f.icon === 'shield' ? '🛡️' : 
                            f.icon === 'zap' ? '⚡' : 
                            f.icon === 'users' ? '👥' : 
                            f.icon === 'chart' ? '📈' : '✓'}</span>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">${f.title}</h3>
                    <p class="text-gray-600">${f.description}</p>
                </div>`).join('')}
            </div>
        </div>
    </section>
    
    <!-- Pricing Section -->
    <section class="py-16 bg-gray-50">
        <div class="container mx-auto px-6">
            <h2 class="text-3xl font-bold text-center mb-12">Pricing</h2>
            <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                ${data.pricing.tiers.map(t => `
                <div class="bg-white p-8 rounded-2xl border-2 ${t.highlighted ? 'border-blue-500 shadow-xl' : 'border-gray-200'} relative">
                    ${t.highlighted ? '<div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</div>' : ''}
                    <h3 class="text-2xl font-bold mb-2">${t.name}</h3>
                    <div class="mb-6">
                        <span class="text-4xl font-bold">${t.price}</span>
                        <span class="text-gray-500">/${t.period}</span>
                    </div>
                    <ul class="space-y-3 mb-8">
                        ${t.features.map(ft => `<li class="flex items-start gap-2">
                            <svg class="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>${ft}</span>
                        </li>`).join('')}
                    </ul>
                    <button class="w-full py-3 rounded-lg font-semibold ${t.highlighted ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'} transition-colors">
                        ${t.cta}
                    </button>
                </div>`).join('')}
            </div>
        </div>
    </section>
    
    <!-- FAQ Section -->
    <section class="py-16 bg-white">
        <div class="container mx-auto px-6 max-w-3xl">
            <h2 class="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div class="space-y-4">
                ${data.faq.map((item, i) => `
                <div class="border border-gray-200 rounded-lg overflow-hidden">
                    <details class="group">
                        <summary class="flex items-center justify-between p-6 cursor-pointer list-none">
                            <span class="text-lg font-semibold">${item.question}</span>
                            <span class="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div class="px-6 pb-6 pt-2 text-gray-600">
                            ${item.answer}
                        </div>
                    </details>
                </div>`).join('')}
            </div>
        </div>
    </section>
    
    <!-- Final CTA -->
    <section class="py-20 bg-linear-to-r from-blue-600 to-purple-600 text-white text-center">
        <div class="container mx-auto px-6">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">${data.final_cta.headline}</h2>
            <p class="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">${data.final_cta.subtext}</p>
            <button class="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                ${data.final_cta.button_text}
            </button>
        </div>
    </section>
</body>
</html>`;
}

function LandingPagePreviewCode({ data: initialData, sessionId, onRegenerate }) {
    const [data, setData] = useState(initialData);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'code'
    const [activeCodeTab, setActiveCodeTab] = useState('html'); // 'html', 'css', 'js'
    const [iframeKey, setIframeKey] = useState(0); // Force re-render iframe
    const [copied, setCopied] = useState(false);

    // If data comes in JSON format (old) or structured format (new), handle it
    const htmlContent = data.html || "<h1>No HTML Generated</h1>";
    const cssContent = data.css || "/* No CSS */";
    const jsContent = data.js || "// No JS";

    const handleRegenerate = async () => {
        setIsRegenerating(true);
        try {
            const result = await sessionApi.regenerate(sessionId, 'landing_content');
            setData(result.data);
            setIframeKey(prev => prev + 1);
            if (onRegenerate) onRegenerate(result.data);
        } catch (error) {
            console.error('Failed to regenerate:', error);
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleCopy = () => {
        let content = '';
        if (activeCodeTab === 'html') content = htmlContent;
        if (activeCodeTab === 'css') content = cssContent;
        if (activeCodeTab === 'js') content = jsContent;

        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        // Create a zip-like structure or just download the current tab?
        // Simple implementation: Download a single html file with embedded css/js for easy preview
        const fullPage = `
<!DOCTYPE html>
<html>
<head>
    <style>
        ${cssContent}
    </style>
</head>
<body>
    ${htmlContent.replace('<!DOCTYPE html>', '').replace('<html>', '').replace('<body>', '').replace('</body>', '').replace('</html>', '')}
    <script>
        ${jsContent}
    </script>
</body>
</html>`;

        const blob = new Blob([fullPage], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'landing_page.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Construct the srcDoc for iframe
    // We inject the CSS and JS directly
    const iframeSrcDoc = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                ${cssContent}
                /* Hide scrollbar for cleaner preview */
                ::-webkit-scrollbar { width: 0px; background: transparent; }
            </style>
        </head>
        <body>
            ${htmlContent.replace('<!DOCTYPE html>', '').replace('<html>', '').replace('<body>', '').replace('</body>', '').replace('</html>', '')}
            <script>
                try {
                    ${jsContent}
                } catch(e) { console.error("JS Error:", e); }
            </script>
        </body>
        </html>
    `;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="results-container"
        >
            {/* Hero */}
            <motion.div className="results-hero">
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
                <h1 className="results-title">Landing Page</h1>
                <p className="results-subtitle">Preview and export your landing page code</p>
                <div className="results-actions">
                    <button
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="results-btn results-btn-primary"
                    >
                        <RefreshCw className={isRegenerating ? 'animate-spin' : ''} size={18} />
                        {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                    </button>
                    <button onClick={handleDownload} className="results-btn results-btn-secondary">
                        <Download size={18} />
                        Download HTML
                    </button>
                </div>
            </motion.div>

            {/* Tab Switcher */}
            <div className="landing-tab-switcher">
                <button
                    onClick={() => setViewMode('preview')}
                    className={`landing-tab ${viewMode === 'preview' ? 'active' : ''}`}
                >
                    <Eye size={18} /> Preview
                </button>
                <button
                    onClick={() => setViewMode('code')}
                    className={`landing-tab ${viewMode === 'code' ? 'active' : ''}`}
                >
                    <Code size={18} /> Code
                </button>
            </div>

            {/* Main Content Area */}
            <div className="landing-code-preview-container">
                {viewMode === 'preview' ? (
                    <iframe
                        key={iframeKey}
                        srcDoc={iframeSrcDoc}
                        title="Landing Page Preview"
                        className="landing-iframe"
                        sandbox="allow-scripts allow-same-origin"
                    />
                ) : (
                    <div className="landing-code-view">
                        {/* Code Toolbar */}
                        <div className="landing-code-toolbar">
                            <div className="landing-code-tabs">
                                {['html', 'css', 'js'].map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => setActiveCodeTab(lang)}
                                        className={`landing-code-tab ${activeCodeTab === lang ? 'active' : ''}`}
                                    >
                                        {lang.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            <button onClick={handleCopy} className="landing-code-copy-btn">
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                        {/* Code Editor Area */}
                        <pre className="landing-code-editor">
                            <code>
                                {activeCodeTab === 'html' && htmlContent}
                                {activeCodeTab === 'css' && cssContent}
                                {activeCodeTab === 'js' && jsContent}
                            </code>
                        </pre>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function LandingPagePreview({ data: initialData, sessionId, onRegenerate }) {
  const isStructured = initialData?.hero && initialData?.features;
  
  if (!isStructured) {
    // Fallback to old format component
    return <LandingPagePreviewCode data={initialData} sessionId={sessionId} onRegenerate={onRegenerate} />;
  }
  
  return <LandingPagePreviewStructured data={initialData} sessionId={sessionId} onRegenerate={onRegenerate} />;
}

export default LandingPagePreview;
