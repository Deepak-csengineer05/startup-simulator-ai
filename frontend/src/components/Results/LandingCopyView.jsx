import { motion } from 'framer-motion';
import { Copy, Check, Code2, FileCode } from 'lucide-react';
import { useState } from 'react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

function LandingCopyView({ data }) {
    const [copiedSection, setCopiedSection] = useState(null);

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Code2 className="w-12 h-12 text-[var(--color-text-muted)] mb-4" />
                <p className="text-[var(--color-text-secondary)] text-lg font-medium mb-2">
                    No landing content available
                </p>
                <p className="text-[var(--color-text-tertiary)] text-sm">
                    Generate a startup concept to see landing page code
                </p>
            </div>
        );
    }

    const copyToClipboard = (text, section) => {
        navigator.clipboard.writeText(text);
        setCopiedSection(section);
        setTimeout(() => setCopiedSection(null), 2000);
    };

    // Check if data is in new structured format
    const isStructured = data.hero && data.hero.headline;

    // Generate copyable sections
    const heroSection = isStructured 
        ? `<!-- Hero Section -->
<section class="hero-section">
  <h1>${data.hero.headline}</h1>
  <p class="subtitle">${data.hero.subheadline}</p>
  <button class="cta-button">${data.hero.cta_text}</button>
</section>`
        : `<!-- Hero Section -->
<section class="hero-section">
  <h1>${data.hero_headline}</h1>
  <p class="subtitle">${data.hero_subtitle}</p>
  <button class="cta-button">${data.primary_cta}</button>
</section>`;

    const featuresSection = `<!-- Features Section -->
<section class="features-section">
  <h2>Features</h2>
  <div class="features-grid">
${(isStructured ? data.features : data.feature_blocks)?.map(f => `    <div class="feature-card">
      <div class="feature-icon">${f.icon}</div>
      <h3>${f.title}</h3>
      <p>${f.description}</p>
    </div>`).join('\n')}
  </div>
</section>`;

    const pricingSection = `<!-- Pricing Section -->
<section class="pricing-section">
  <h2>Pricing</h2>
  <div class="pricing-grid">
${(isStructured ? data.pricing.tiers : data.pricing_tiers)?.map(tier => `    <div class="pricing-card${tier.highlighted ? ' highlighted' : ''}">
      <h3>${tier.name}</h3>
      <div class="price">${tier.price}<span class="period">/${tier.period}</span></div>
      <ul class="features-list">
${tier.features.map(f => `        <li>${f}</li>`).join('\n')}
      </ul>
      <button class="pricing-cta">${tier.cta}</button>
    </div>`).join('\n')}
  </div>
</section>`;

    const faqSection = `<!-- FAQ Section -->
<section class="faq-section">
  <h2>Frequently Asked Questions</h2>
  <div class="faq-list">
${data.faq?.map(faq => `    <div class="faq-item">
      <h3 class="faq-question">${faq.question}</h3>
      <p class="faq-answer">${faq.answer}</p>
    </div>`).join('\n')}
  </div>
</section>`;

    const ctaSection = `<!-- Final CTA Section -->
<section class="final-cta-section">
  <h2>${data.final_cta.headline}</h2>
  <p>${data.final_cta.subtext}</p>
  <button class="cta-button">${data.final_cta.button_text}</button>
</section>`;

    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isStructured ? data.hero.headline : data.hero_headline}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .hero-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 20px; text-align: center; }
    .hero-section h1 { font-size: 3rem; margin-bottom: 1rem; }
    .hero-section .subtitle { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; }
    .cta-button { background: white; color: #667eea; padding: 1rem 2rem; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s; }
    .cta-button:hover { transform: scale(1.05); }
    .features-section, .pricing-section, .faq-section, .final-cta-section { padding: 80px 20px; max-width: 1200px; margin: 0 auto; }
    .features-grid, .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 2rem; }
    .feature-card, .pricing-card { background: #f7fafc; padding: 2rem; border-radius: 12px; text-align: center; }
    .pricing-card.highlighted { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; transform: scale(1.05); }
    h2 { font-size: 2.5rem; text-align: center; margin-bottom: 1rem; }
    h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .faq-list { max-width: 800px; margin: 2rem auto; }
    .faq-item { background: #f7fafc; padding: 1.5rem; margin-bottom: 1rem; border-radius: 8px; }
    .final-cta-section { background: #f7fafc; text-align: center; }
  </style>
</head>
<body>
${heroSection}

${featuresSection}

${pricingSection}

${faqSection}

${ctaSection}
</body>
</html>`;

    const CodeBlock = ({ title, code, section }) => (
        <motion.div variants={itemVariants} className="card">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-[var(--color-primary)]" />
                    <h3 className="h5">{title}</h3>
                </div>
                <button
                    onClick={() => copyToClipboard(code, section)}
                    className="btn btn-secondary flex items-center gap-2"
                    aria-label={`Copy ${title} to clipboard`}
                >
                    {copiedSection === section ? (
                        <>
                            <Check className="w-4 h-4" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            Copy
                        </>
                    )}
                </button>
            </div>
            <pre className="bg-[var(--color-bg-secondary)] p-4 rounded-lg overflow-x-auto text-sm">
                <code className="text-[var(--color-text-secondary)] font-mono">{code}</code>
            </pre>
        </motion.div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-6 pb-8"
        >
            <motion.div variants={itemVariants} className="text-center">
                <h2 className="h2 mb-2">
                    Landing Page Code
                </h2>
                <p className="text-[var(--color-text-secondary)]">
                    Copy any section or download the complete HTML file
                </p>
            </motion.div>

            {/* Full HTML Download */}
            <motion.div variants={itemVariants} className="card bg-[var(--color-primary-bg)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileCode className="w-6 h-6 text-[var(--color-primary)]" />
                        <div>
                            <h3 className="h5">Complete Landing Page</h3>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                Full HTML with inline CSS styling
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => copyToClipboard(fullHTML, 'full')}
                        className="btn btn-secondary flex items-center gap-2"
                        aria-label="Copy complete landing page HTML to clipboard"
                    >
                        {copiedSection === 'full' ? (
                            <>
                                <Check className="w-4 h-4" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                Copy Full HTML
                            </>
                        )}
                    </button>
                </div>
            </motion.div>

            {/* Individual Sections */}
            <CodeBlock title="Hero Section" code={heroSection} section="hero" />
            <CodeBlock title="Features Section" code={featuresSection} section="features" />
            <CodeBlock title="Pricing Section" code={pricingSection} section="pricing" />
            <CodeBlock title="FAQ Section" code={faqSection} section="faq" />
            <CodeBlock title="Final CTA" code={ctaSection} section="cta" />
        </motion.div>
    );
}

export default LandingCopyView;