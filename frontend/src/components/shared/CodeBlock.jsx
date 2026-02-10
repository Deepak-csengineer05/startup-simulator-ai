import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';

/**
 * CodeBlock - Syntax-highlighted code block with copy button
 */

export function CodeBlock({ 
  code, 
  language = 'html', 
  title,
  maxHeight = '400px',
  showLineNumbers = true 
}) {
  const [copied, setCopied] = useState(false);
  const [highlighted, setHighlighted] = useState('');

  useEffect(() => {
    const html = Prism.highlight(code, Prism.languages[language] || Prism.languages.html, language);
    setHighlighted(html);
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-4 py-3 bg-(--color-bg-secondary) border-b border-(--color-border)">
          <span className="text-sm font-medium text-(--color-text-primary)">
            {title}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-(--color-bg-tertiary) hover:bg-(--color-bg-hover) transition-colors text-sm font-medium text-(--color-text-secondary)"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-(--color-success)" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </motion.button>
        </div>
      )}

      {/* Code Content */}
      <div 
        className="relative overflow-auto bg-[#1e1e1e] text-sm"
        style={{ maxHeight }}
      >
        <pre className={`p-4 m-0 ${showLineNumbers ? 'line-numbers' : ''}`}>
          <code 
            className={`language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>
    </div>
  );
}
