import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Code2 } from 'lucide-react';
import LandingPagePreview from './LandingPagePreview';
import LandingCopyView from './LandingCopyView';

/**
 * Wrapper component that toggles between Landing Page Preview and Code View
 */
function LandingPageWithCode({ data, sessionId, onRegenerate }) {
    const [activeView, setActiveView] = useState('preview'); // 'preview' or 'code'

    return (
        <div className="flex flex-col h-full">
            {/* Tab Switcher */}
            <div className="flex items-center gap-2 mb-4 border-b border-[var(--color-border)]">
                <button
                    onClick={() => setActiveView('preview')}
                    className={`
                        flex items-center gap-2 px-4 py-3 font-medium transition-all relative
                        ${activeView === 'preview'
                            ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                        }
                    `}
                >
                    <Eye className="w-4 h-4" />
                    Preview
                </button>
                <button
                    onClick={() => setActiveView('code')}
                    className={`
                        flex items-center gap-2 px-4 py-3 font-medium transition-all relative
                        ${activeView === 'code'
                            ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                        }
                    `}
                >
                    <Code2 className="w-4 h-4" />
                    Copy Code
                </button>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {activeView === 'preview' ? (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1"
                    >
                        <LandingPagePreview 
                            data={data} 
                            sessionId={sessionId} 
                            onRegenerate={onRegenerate} 
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="code"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 overflow-auto"
                    >
                        <LandingCopyView data={data} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default LandingPageWithCode;
