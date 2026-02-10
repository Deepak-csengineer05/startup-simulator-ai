import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2, Lightbulb, Palette, FileText,
    TrendingUp, Presentation, Code, DollarSign, AlertTriangle,
    ArrowLeft, ChevronRight, PanelLeftClose, PanelLeft, Send, X, StopCircle, RefreshCw
} from 'lucide-react';
import { sessionApi } from '../services/api';
import { useToast } from './shared/Toast';
import EmptyState from './shared/EmptyState';
import { DashboardGridSkeleton } from './shared/Skeleton';
import CustomSelect from './shared/CustomSelect';
import GenerationLoader from './shared/GenerationLoader';

// Components
import DashboardCard from './DashboardCard';
import ThesisView from './Results/ThesisView';
//import BrandView from './Results/BrandView';
import BrandView from './Results/brand/BrandView';
import LandingPageWithCode from './Results/LandingPageWithCode';
import MarketView from './Results/MarketView';
import PitchDeckView from './Results/PitchDeckView';
import CodePreview from './Results/CodePreview';
import BusinessModelView from './Results/BusinessModelView';
import RiskAnalysisView from './Results/RiskAnalysisView';

const DOMAINS = ['SaaS', 'Fintech', 'Edtech', 'Healthtech', 'E-commerce', 'Marketplace', 'Consumer App', 'B2B', 'AI/ML', 'General'];
const TONES = ['Professional', 'Casual', 'Playful', 'Bold', 'Luxury', 'Friendly', 'Technical', 'Minimalist'];

// Module Definitions
const MODULES = [
    { id: 'refined_concept', label: 'Idea & Concept', icon: Lightbulb, description: "Refine your raw idea into a structured product thesis and user personas.", component: ThesisView },
    { id: 'brand_profile', label: 'Brand & Identity', icon: Palette, description: "Generate names, color palettes, and brand voice guidelines.", component: BrandView },
    { id: 'market_analysis', label: 'Market Analysis', icon: TrendingUp, description: "Analyze competitors, calculate TAM/SAM, and plan your go-to-market.", component: MarketView },
    { id: 'code_preview', label: 'MVP Builder', icon: Code, description: "Technical architecture, stack recommendations, and core code logic.", component: CodePreview },
    { id: 'business_model', label: 'Business Model', icon: DollarSign, description: "Revenue streams, cost structures, and partnership strategies.", component: BusinessModelView },
    { id: 'risk_analysis', label: 'Risk Analysis', icon: AlertTriangle, description: "Critical failure prediction and success probability scoring.", component: RiskAnalysisView },
    { id: 'pitch_deck', label: 'Pitch Deck', icon: Presentation, description: "10-slide investor deck outline with speaker notes.", component: PitchDeckView },
    { id: 'landing_content', label: 'Landing Page', icon: FileText, description: "Interactive preview & copyable code for your landing page.", component: LandingPageWithCode },
];

function Dashboard() {
    const { toast } = useToast();
    const ideaInputRef = useRef(null);
    const abortControllerRef = useRef(null);
    const generationStartTimeRef = useRef(null);

    // Input state
    const [ideaText, setIdeaText] = useState('');
    const [domain, setDomain] = useState('SaaS');
    const [tone, setTone] = useState('Professional');

    // Flow state
    const [sessionId, setSessionId] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, creating, processing, completed, failed
    const [outputs, setOutputs] = useState(null);
    const [activeModuleId, setActiveModuleId] = useState(null);
    const [error, setError] = useState(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [generatingModules, setGeneratingModules] = useState(new Set()); // Track individual module generation
    const [generationTime, setGenerationTime] = useState(0);

    // Character counter
    const MAX_CHARS = 500;
    const charCount = ideaText.length;
    const isOverLimit = charCount > MAX_CHARS;

    // Auto-focus on mount
    useEffect(() => {
        ideaInputRef.current?.focus();
    }, []);

    // Responsive sidebar: auto-collapse on mobile, auto-expand on desktop
    useEffect(() => {
        const handleResize = () => {
            // Use matchMedia for better consistency with CSS breakpoints
            const isMobile = !window.matchMedia('(min-width: 768px)').matches;
            setIsSidebarCollapsed(isMobile);
        };

        // Set initial state
        handleResize();

        // Listen for resize events
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Debug logging only when outputs change
    useEffect(() => {
        if (outputs) {
            console.log('📦 Dashboard - Outputs Updated:', outputs);
            if (activeModuleId) {
                console.log('📋 Active Module Data:', outputs[activeModuleId]);
            }
        }
    }, [outputs, activeModuleId]);

    // Polling logic
    useEffect(() => {
        if (status !== 'processing' || !sessionId) return;
        const pollInterval = setInterval(async () => {
            try {
                const data = await sessionApi.getOutputs(sessionId);
                if (data.status === 'completed') {
                    setOutputs(data.outputs);
                    setStatus('completed');
                    clearInterval(pollInterval);
                } else if (data.status === 'failed') {
                    setError(data.error || 'Generation failed');
                    setStatus('failed');
                    clearInterval(pollInterval);
                }
            } catch (err) { console.error('Polling error:', err); }
        }, 2000);
        return () => clearInterval(pollInterval);
    }, [status, sessionId]);

    // Track elapsed time during generation
    useEffect(() => {
        if (status !== 'creating' && status !== 'processing') return;

        const timer = setInterval(() => {
            if (generationStartTimeRef.current) {
                const elapsed = Math.floor((Date.now() - generationStartTimeRef.current) / 1000);
                setGenerationTime(elapsed);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [status]);

    const handleGenerate = useCallback(async (e) => {
        // Prevent any default behavior
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!ideaText.trim()) {
            toast.error('Please enter your startup idea');
            return;
        }
        if (isOverLimit) {
            toast.warning(`Idea is too long (${charCount}/${MAX_CHARS} characters)`);
            return;
        }

        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();
        generationStartTimeRef.current = Date.now();
        setGenerationTime(0);

        // IMPORTANT: Clear old outputs and errors when starting new generation
        setOutputs(null);
        setError(null);
        setStatus('creating');

        try {
            console.log('Creating session with:', { ideaText: ideaText.trim(), domain, tone });
            const createResponse = await sessionApi.create(
                { ideaText: ideaText.trim(), domain, tone },
                { signal: abortControllerRef.current.signal }
            );
            console.log('Session created:', createResponse);

            setSessionId(createResponse.session_id);
            setStatus('processing');
            toast.info('Generating your startup...');

            const genResponse = await sessionApi.generate(
                createResponse.session_id,
                { signal: abortControllerRef.current.signal }
            );
            console.log('Generation response:', genResponse);

            // Handle completed or partial results
            if (genResponse.status === 'completed' || genResponse.status === 'partial') {
                console.log('Received outputs:', genResponse.data);
                console.log('Available modules:', Object.keys(genResponse.data || {}));
                setOutputs(genResponse.data);
                setStatus('completed');
                const elapsed = Math.round((Date.now() - generationStartTimeRef.current) / 1000);

                if (genResponse.status === 'partial') {
                    toast.success(`Generation stopped! Here's what was completed (${elapsed}s)`);
                } else {
                    toast.success(`Core modules generated in ${elapsed}s! Other modules available on-demand.`);
                }
            }
        } catch (err) {
            // Handle aborted request - show partial results if any
            if (err.name === 'AbortError' || err.name === 'CanceledError') {
                console.log('Request was cancelled by user');

                // Try to fetch whatever was generated before cancellation
                // Use sessionId state which was already set earlier
                if (sessionId) {
                    try {
                        console.log('Fetching partial results for session:', sessionId);
                        const partialData = await sessionApi.getOutputs(sessionId);
                        console.log('Partial data received:', partialData);

                        // Check if any modules have actual data (not null/undefined)
                        const hasAnyData = partialData.outputs &&
                            Object.values(partialData.outputs).some(value => value !== null && value !== undefined);

                        if (hasAnyData) {
                            console.log('Setting partial outputs:', partialData.outputs);
                            setOutputs(partialData.outputs);
                            setStatus('completed');
                            toast.info('Generation stopped! Showing completed modules.');
                        } else {
                            console.log('No modules were completed before cancellation');
                            toast.warning('Generation stopped too early - no modules completed yet.');
                        }
                    } catch (fetchErr) {
                        console.error('Could not fetch partial results:', fetchErr);
                        toast.error('Could not retrieve partial results.');
                    }
                }
                return;
            }

            console.error('Generation error:', err);
            let errorMsg = 'Failed to generate. Please try again.';

            if (err.code === 'ERR_NETWORK') {
                errorMsg = 'Cannot connect to server. Make sure the backend is running on http://localhost:3000';
            } else if (err.response?.status === 401) {
                errorMsg = 'Authentication required. Please log in again.';
            } else if (err.response?.data?.error) {
                errorMsg = err.response.data.error;
            }

            setError(errorMsg);
            setStatus('failed');
            toast.error(errorMsg);
        } finally {
            abortControllerRef.current = null;
            generationStartTimeRef.current = null;
        }
    }, [ideaText, domain, tone, toast, charCount, isOverLimit]);

    // Handle Stop Generation - Actually cancel the request AND fetch what was saved
    const handleStopGeneration = useCallback(async () => {
        if (abortControllerRef.current) {
            console.log('Aborting generation request...');
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        // Don't reset sessionId - we need it to fetch results!
        setGenerationTime(0);
        generationStartTimeRef.current = null;
        toast.info('Generation stopped - fetching saved modules...');

        // Fetch whatever was saved in the database
        if (sessionId) {
            try {
                const result = await sessionApi.getOutputs(sessionId);
                console.log('Fetched saved outputs after stop:', result);

                const hasAnyData = result.outputs &&
                    Object.values(result.outputs).some(value => value !== null && value !== undefined);

                if (hasAnyData) {
                    setOutputs(result.outputs);
                    setStatus('completed');
                    toast.success('Loaded saved modules successfully!');
                } else {
                    setStatus('idle');
                    toast.warning('No modules were saved yet.');
                }
            } catch (err) {
                console.error('Error fetching saved outputs:', err);
                setStatus('idle');
                toast.error('Could not load saved modules.');
            }
        } else {
            setStatus('idle');
        }
    }, [sessionId, toast]);

    // Handle Refresh - fetch latest outputs from database
    const handleRefresh = useCallback(async () => {
        if (!sessionId) {
            toast.info('No active session to refresh');
            return;
        }

        try {
            toast.info('Refreshing modules...');
            const result = await sessionApi.getOutputs(sessionId);
            console.log('Refreshed outputs:', result);

            const hasAnyData = result.outputs &&
                Object.values(result.outputs).some(value => value !== null && value !== undefined);

            if (hasAnyData) {
                setOutputs(result.outputs);
                setStatus('completed');
                toast.success('Modules refreshed!');
            } else {
                toast.warning('No modules available yet.');
            }
        } catch (err) {
            console.error('Error refreshing outputs:', err);
            toast.error('Could not refresh modules.');
        }
    }, [sessionId, toast]);

    // Handle Module Navigation
    const openModule = (id) => {
        if (!outputs) {
            toast.warning('Please generate a startup first');
            return;
        }

        if (!outputs[id]) {
            console.warn(`Module data not found for: ${id}`, 'Available keys:', Object.keys(outputs));
            toast.warning(`${MODULES.find(m => m.id === id)?.label || 'This module'} data is not available yet`);
            return;
        }

        setActiveModuleId(id);
    };

    const closeModule = () => {
        setActiveModuleId(null);
    };

    // Handle individual module generation
    const handleGenerateModule = async (moduleId) => {
        if (!sessionId) {
            toast.error('No session found. Please generate a startup first.');
            return;
        }

        setGeneratingModules(prev => new Set(prev).add(moduleId));
        toast.info(`Generating ${MODULES.find(m => m.id === moduleId)?.label}...`);

        try {
            const response = await sessionApi.regenerate(sessionId, moduleId);

            // Update outputs with the new module data
            setOutputs(prev => ({
                ...prev,
                [moduleId]: response.data
            }));

            toast.success(`${MODULES.find(m => m.id === moduleId)?.label} generated successfully!`);
        } catch (err) {
            console.error('Module generation error:', err);
            toast.error(`Failed to generate ${MODULES.find(m => m.id === moduleId)?.label}`);
        } finally {
            setGeneratingModules(prev => {
                const newSet = new Set(prev);
                newSet.delete(moduleId);
                return newSet;
            });
        }
    };

    // Current Module Component
    const ActiveComponent = activeModuleId ? MODULES.find(m => m.id === activeModuleId)?.component : null;
    const activeModuleData = activeModuleId && outputs ? outputs[activeModuleId] : null;

    const isLoading = status === 'creating' || status === 'processing';

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>

            {/* MODERN COLLAPSIBLE SIDEBAR (ChatGPT-style) */}
            {/* Backdrop for mobile */}
            <AnimatePresence>
                {!isSidebarCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setIsSidebarCollapsed(true)}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        style={{ backdropFilter: 'blur(4px)' }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {!isSidebarCollapsed && (
                    <motion.aside
                        initial={{ x: -320 }}
                        animate={{ x: 0 }}
                        exit={{ x: -320 }}
                        transition={{
                            type: 'tween',
                            duration: 0.2,
                            ease: [0.4, 0, 0.2, 1]
                        }}
                        className="w-80 shrink-0 flex flex-col fixed md:relative z-50 md:z-auto"
                        style={{
                            height: 'calc(100vh - 3.5rem)', // Account for navbar height
                            background: 'var(--color-bg-card)',
                            borderRight: '1px solid var(--color-border)',
                        }}
                    >
                        {/* Minimal Header */}
                        <div
                            className="flex items-center justify-between"
                            style={{
                                padding: 'var(--space-2)',
                                borderBottom: '1px solid var(--color-border)',
                            }}
                        >
                            <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                                <span
                                    className="font-semibold"
                                    style={{
                                        fontSize: 'var(--font-size-body)',
                                        color: 'var(--gradient-primary)',
                                    }}
                                >
                                    Make your idea become real
                                </span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsSidebarCollapsed(true)}
                                className="rounded-md"
                                style={{
                                    color: 'var(--color-text-muted)',
                                    padding: 'var(--space-2) 0 var(--space-2) var(--space-2)', // No right padding
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                aria-label="Collapse sidebar"
                            >
                                <PanelLeftClose style={{ width: '40px', height: '30px' }} />
                            </motion.button>
                        </div>

                        {/* Scrollable Form Content */}
                        <div
                            className="flex-1 overflow-y-auto"
                            style={{
                                padding: 'var(--space-4)',
                                paddingBottom: 'calc(var(--space-4) + 80px)', // Extra padding for sticky button
                            }}
                        >
                            {/* Idea Input */}
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <div
                                    className="flex items-center justify-between"
                                    style={{ marginBottom: 'var(--space-2)' }}
                                >
                                    <label
                                        className="font-medium"
                                        style={{
                                            fontSize: 'var(--font-size-body-sm)',
                                            color: 'var(--color-text-secondary)',
                                        }}
                                    >
                                        Describe your idea
                                    </label>
                                    <span
                                        style={{
                                            fontSize: 'var(--font-size-caption)',
                                            fontWeight: 'var(--font-weight-medium)',
                                            color: isOverLimit ? 'var(--color-error)' : 'var(--color-text-muted)',
                                        }}
                                    >
                                        {charCount}/{MAX_CHARS}
                                    </span>
                                </div>
                                <textarea
                                    ref={ideaInputRef}
                                    value={ideaText}
                                    onChange={(e) => setIdeaText(e.target.value)}
                                    placeholder="A platform that connects freelance designers with small businesses..."
                                    className={`input textarea w-full ${isOverLimit ? 'input-error' : ''}`}
                                    style={{
                                        minHeight: '110px',
                                        maxHeight: '200px',
                                        resize: 'vertical',
                                        fontSize: 'var(--font-size-body-sm)',
                                    }}
                                    disabled={isLoading}
                                    maxLength={MAX_CHARS + 50}
                                />
                            </div>

                            {/* Industry Select */}
                            <CustomSelect
                                label="Industry"
                                value={domain}
                                onChange={(value) => setDomain(value)}
                                options={DOMAINS}
                                disabled={isLoading}
                            />

                            {/* Vibe Select */}
                            <CustomSelect
                                label="Brand Vibe"
                                value={tone}
                                onChange={(value) => setTone(value)}
                                options={TONES}
                                disabled={isLoading}
                            />

                            {/* Error Display */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        padding: 'var(--space-3)',
                                        background: 'var(--color-error-bg)',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: 'var(--space-4)',
                                        display: 'flex',
                                        gap: 'var(--space-2)',
                                        alignItems: 'start',
                                    }}
                                >
                                    <AlertTriangle
                                        style={{
                                            width: '16px',
                                            height: '16px',
                                            color: 'var(--color-error)',
                                            flexShrink: 0,
                                            marginTop: '2px',
                                        }}
                                    />
                                    <p style={{
                                        fontSize: 'var(--font-size-body-sm)',
                                        color: 'var(--color-error)',
                                        margin: 0,
                                    }}>
                                        {error}
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* Sticky Bottom Action Button */}
                        <div
                            style={{
                                padding: 'var(--space-4)',
                                borderTop: '1px solid var(--color-border)',
                                background: 'var(--color-bg-card)',
                            }}
                        >
                            {isLoading ? (
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleStopGeneration}
                                    className="btn w-full"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 'var(--space-2)',
                                        height: '44px',
                                        background: 'var(--color-error)',
                                        color: 'white',
                                        border: 'none',
                                    }}
                                >
                                    <StopCircle style={{ width: '18px', height: '18px' }} />
                                    <span>Stop Generation</span>
                                </motion.button>
                            ) : (
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleGenerate}
                                    disabled={isLoading || !ideaText.trim() || isOverLimit}
                                    className="btn btn-primary w-full"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 'var(--space-2)',
                                        height: '44px',
                                    }}
                                >
                                    <Send style={{ width: '18px', height: '18px' }} />
                                    <span>Generate</span>
                                </motion.button>
                            )}

                            {/* Refresh Button - show when there's a session */}
                            {sessionId && !isLoading && (
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleRefresh}
                                    className="btn w-full"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 'var(--space-2)',
                                        height: '40px',
                                        marginTop: 'var(--space-2)',
                                        background: 'var(--color-bg-secondary)',
                                        color: 'var(--color-text-primary)',
                                        border: '1px solid var(--color-border)',
                                    }}
                                >
                                    <RefreshCw style={{ width: '16px', height: '16px' }} />
                                    <span>Refresh Modules</span>
                                </motion.button>
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>


            {/* Sidebar Toggle Button (when collapsed) - Dashboard Only */}
            <AnimatePresence>
                {isSidebarCollapsed && (
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setIsSidebarCollapsed(false)}
                        className="fixed left-4 top-20 z-30 p-3 rounded-lg shadow-lg"
                        style={{
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        whileHover={{ scale: 1.05, boxShadow: 'var(--shadow-xl)' }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Expand sidebar"
                    >
                        <PanelLeft style={{ width: '20px', height: '20px', color: 'currentColor' }} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* RIGHT PANEL (Content) */}
            <main className="flex-1 overflow-hidden relative" style={{ backgroundColor: 'var(--color-bg-primary)' }}>

                {/* 1. WELCOME STATE (Empty) */}
                {
                    !outputs && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center justify-center h-full"
                            style={{
                                maxWidth: '600px',
                                margin: '0 auto',
                                padding: 'var(--space-12)',
                                textAlign: 'center',
                            }}
                        >
                            {/* Large Logo */}
                            <div
                                style={{
                                    borderRadius: '60px',
                                    overflow: 'hidden',
                                    marginBottom: 'var(--space-8)',
                                    display: 'inline-block',
                                    lineHeight: 0,
                                }}
                            >
                                <motion.img
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                                    src="/logo-secondary.png"
                                    alt="Startup Simulator AI"
                                    style={{
                                        width: '400px',
                                        height: '300px',
                                        objectFit: 'cover',
                                        display: 'block',
                                    }}
                                />
                            </div>

                            {/* Title */}
                            <motion.h3
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                style={{
                                    fontSize: 'var(--font-size-h2)',
                                    fontWeight: 'var(--font-weight-bold)',
                                    color: 'var(--color-text-primary)',
                                    marginBottom: 'var(--space-3)',
                                }}
                            >
                                Ready to build something amazing?
                            </motion.h3>

                            {/* Description */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                style={{
                                    fontSize: 'var(--font-size-body-lg)',
                                    lineHeight: 'var(--line-height-relaxed)',
                                    color: 'var(--color-text-primary)',
                                    opacity: 0.8,
                                }}
                            >
                                Fill out your startup idea on the left to generate a complete business package with AI-powered insights, branding, pitch deck, and more.
                            </motion.p>
                        </motion.div>
                    )
                }

                {/* 2. LOADING STATE */}
                {
                    isLoading && (
                        <div className="dashboard-loading-overlay">
                            <GenerationLoader
                                elapsedTime={generationTime}
                            />
                        </div>
                    )
                }

                {/* 3. GRID PREVIEW STATE */}
                {
                    outputs && !activeModuleId && (
                        <div className="dashboard-grid-wrapper">
                            <motion.header 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="dashboard-header"
                            >
                                <div className="dashboard-header-gradient">
                                    <h2 className="dashboard-title">Your Startup Workspace</h2>
                                    <p className="dashboard-subtitle">Explore your AI-generated business assets</p>
                                </div>
                            </motion.header>

                            <motion.div 
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.08
                                        }
                                    }
                                }}
                                className="dashboard-grid"
                            >
                                {MODULES.map((module) => {
                                    const hasData = outputs && outputs[module.id];
                                    const isGenerating = generatingModules.has(module.id);
                                    return (
                                        <motion.div
                                            key={module.id}
                                            variants={{
                                                hidden: { opacity: 0, y: 20, scale: 0.95 },
                                                visible: { opacity: 1, y: 0, scale: 1 }
                                            }}
                                            transition={{ type: "spring", stiffness: 300, damping: 24 }}
                                        >
                                            <DashboardCard
                                                icon={module.icon}
                                                title={module.label}
                                                description={module.description}
                                                onClick={() => openModule(module.id)}
                                                disabled={!hasData}
                                                onGenerate={!hasData ? () => handleGenerateModule(module.id) : null}
                                                isGenerating={isGenerating}
                                            />
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </div>
                    )
                }

                {/* 4. DETAIL MODULE STATE */}
                <AnimatePresence>
                    {activeModuleId && (
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute inset-0 bg-white dark:bg-slate-900 z-40 flex flex-col"
                        >
                            {/* Detailed Header */}
                            <div className="h-16 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur">
                                <button
                                    onClick={closeModule}
                                    className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span className="font-semibold">Back to Workspace</span>
                                </button>

                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span className="hidden sm:inline">Session ID: {sessionId?.slice(-6)}</span>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-900/50">
                                {ActiveComponent && activeModuleData && (
                                    <ActiveComponent
                                        data={activeModuleData}
                                        sessionId={sessionId}
                                        onRegenerate={(newData) => {
                                            // Update local state when regeneration happens inside a component
                                            setOutputs(prev => ({
                                                ...prev,
                                                [activeModuleId]: newData
                                            }));
                                        }}
                                    />
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main >
        </div >
    );
}

export default Dashboard;
