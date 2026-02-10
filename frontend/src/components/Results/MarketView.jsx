import { motion } from 'framer-motion';
import { BarChart3, Users, TrendingUp, Target, Zap, Shield, Copy, Download, Sparkles } from 'lucide-react';
import { FunnelChart } from '../shared/FunnelChart';
import './ResultsStyles.css';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

function MarketView({ data }) {
    if (!data || (!data.market_size && !data.competitors)) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <BarChart3 className="w-12 h-12 text-(--color-text-muted) mb-4" />
                <p className="text-(--color-text-secondary) text-lg font-medium mb-2">
                    No market analysis available
                </p>
                <p className="text-(--color-text-tertiary) text-sm">
                    Generate a startup concept to see market analysis
                </p>
            </div>
        );
    }

    const swotColors = {
        strengths: { bg: 'bg-(--color-success-bg)', text: 'text-(--color-success)', border: 'border-(--color-success)', icon: Zap },
        weaknesses: { bg: 'bg-(--color-error-bg)', text: 'text-(--color-error)', border: 'border-(--color-error)', icon: Shield },
        opportunities: { bg: 'bg-(--color-info-bg)', text: 'text-(--color-info)', border: 'border-(--color-info)', icon: TrendingUp },
        threats: { bg: 'bg-(--color-warning-bg)', text: 'text-(--color-warning)', border: 'border-(--color-warning)', icon: Target }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="results-container"
        >
            {/* Hero Header */}
            <motion.div variants={itemVariants} className="results-hero">
                <motion.div
                    className="results-hero-icon"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                    <BarChart3 className="w-10 h-10 text-white" />
                </motion.div>

                <h1 className="results-hero-title">
                    Market Analysis
                </h1>

                <p className="results-hero-subtitle">
                    Market size, competition, and strategic positioning
                </p>
            </motion.div>

            {/* Market Size - Funnel Visualization */}
            {data.market_size && (
                <motion.div variants={itemVariants} className="results-section">
                    <div className="results-section-header">
                        <div className="results-section-icon">
                            <BarChart3 />
                        </div>
                        <div>
                            <h2 className="results-section-title">Market Opportunity</h2>
                            <p className="results-section-subtitle">Total addressable market breakdown</p>
                        </div>
                    </div>
                    
                    <div className="market-funnel">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="market-funnel-stage tam"
                        >
                            <div className="market-funnel-stage-header">
                                <span className="market-funnel-stage-label">TAM</span>
                                <span className="market-funnel-stage-value">{data.market_size.tam?.value || data.market_size.tam}</span>
                            </div>
                            <p className="market-funnel-stage-description">{data.market_size.tam?.description || 'Total Addressable Market'}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="market-funnel-stage sam"
                        >
                            <div className="market-funnel-stage-header">
                                <span className="market-funnel-stage-label">SAM</span>
                                <span className="market-funnel-stage-value">{data.market_size.sam?.value || data.market_size.sam}</span>
                            </div>
                            <p className="market-funnel-stage-description">{data.market_size.sam?.description || 'Serviceable Addressable Market'}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 }}
                            className="market-funnel-stage som"
                        >
                            <div className="market-funnel-stage-header">
                                <span className="market-funnel-stage-label">SOM</span>
                                <span className="market-funnel-stage-value">{data.market_size.som?.value || data.market_size.som}</span>
                            </div>
                            <p className="market-funnel-stage-description">{data.market_size.som?.description || 'Serviceable Obtainable Market'}</p>
                        </motion.div>
                    </div>
                </motion.div>
            )}

            {/* Competitors */}
            {data.competitors && data.competitors.length > 0 && (
                <motion.div variants={itemVariants} className="results-section">
                    <div className="results-section-header">
                        <div className="results-section-icon">
                            <Users />
                        </div>
                        <div>
                            <h2 className="results-section-title">Competitive Landscape</h2>
                            <p className="results-section-subtitle">{data.competitors.length} key competitors identified</p>
                        </div>
                    </div>

                    <div className="competitor-grid">
                        {data.competitors.map((competitor, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * index }}
                                whileHover={{ y: -4 }}
                                className="competitor-card"
                            >
                                <div className="competitor-card-header">
                                    <div>
                                        <h4 className="competitor-card-name">{competitor.name}</h4>
                                        {competitor.market_position && (
                                            <span className="competitor-card-position">{competitor.market_position}</span>
                                        )}
                                    </div>
                                    <div className="competitor-card-rank">{index + 1}</div>
                                </div>
                                
                                {competitor.strengths && (
                                    <div className="competitor-card-section">
                                        <p className="competitor-card-label strengths">Strengths</p>
                                        <p className="competitor-card-text">{competitor.strengths}</p>
                                    </div>
                                )}
                                
                                {competitor.weaknesses && (
                                    <div className="competitor-card-section">
                                        <p className="competitor-card-label weaknesses">Weaknesses</p>
                                        <p className="competitor-card-text">{competitor.weaknesses}</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* SWOT Analysis - 4 Quadrant Grid */}
            {data.swot && (
                <motion.div variants={itemVariants} className="results-section">
                    <div className="results-section-header">
                        <div className="results-section-icon">
                            <Target />
                        </div>
                        <div>
                            <h2 className="results-section-title">SWOT Analysis</h2>
                            <p className="results-section-subtitle">Strategic positioning and market opportunities</p>
                        </div>
                    </div>

                    <div className="swot-grid">
                        {Object.entries(swotColors).map(([key, style]) => {
                            const items = data.swot[key];
                            if (!items || items.length === 0) return null;
                            
                            const Icon = style.icon;
                            
                            return (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className={`swot-card ${key}`}
                                >
                                    <div className="swot-card-header">
                                        <div className="swot-card-icon">
                                            <Icon />
                                        </div>
                                        <h3 className="swot-card-title">{key}</h3>
                                    </div>
                                    
                                    <ul className="swot-card-list">
                                        {items.map((item, idx) => (
                                            <li key={idx} className="swot-card-item">
                                                <span className="swot-card-bullet" />
                                                <p className="swot-card-text">{item}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Go-to-Market Strategy */}
            {data.gtm_strategy && (
                <motion.div variants={itemVariants} className="results-section">
                    <div className="results-section-header">
                        <div className="results-section-icon">
                            <TrendingUp />
                        </div>
                        <div>
                            <h2 className="results-section-title">Go-to-Market Strategy</h2>
                            <p className="results-section-subtitle">Strategic approach to market entry</p>
                        </div>
                    </div>
                    
                    <div className="gtm-strategy-list">
                        {data.gtm_strategy.phases?.map((phase, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                                whileHover={{ x: 4 }}
                                className="gtm-strategy-phase"
                            >
                                <div className="gtm-phase-number">{index + 1}</div>
                                <div className="gtm-phase-content">
                                    <h4 className="gtm-phase-title">{phase.phase || `Phase ${index + 1}`}</h4>
                                    <p className="gtm-phase-text">{phase.strategy || phase}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

export default MarketView;
