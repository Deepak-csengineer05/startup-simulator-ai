import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Trash2, Download, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { sessionApi } from '../services/api';
import { useToast } from './shared/Toast';

// Generate unique message ID
let messageIdCounter = 0;
const generateMessageId = () => {
    messageIdCounter++;
    return `msg-${Date.now()}-${messageIdCounter}`;
};

function AIAssistant() {
    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    
    const [messages, setMessages] = useState([
        {
            id: generateMessageId(),
            role: 'assistant',
            content: "Hi! I'm SUS AI, your personal startup assistant. I can help you understand the platform, explain your generated results, and answer questions about your startup idea. What would you like to know?",
            timestamp: new Date().toISOString()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [sessionData, setSessionData] = useState(null);
    const [recentSessions, setRecentSessions] = useState([]);
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const [isSuggestionsCollapsed, setIsSuggestionsCollapsed] = useState(false);
    
    // Load session from URL param
    useEffect(() => {
        const sessionId = searchParams.get('session');
        if (sessionId) {
            loadSessionContext(sessionId);
        }
        fetchRecentSessions();
    }, [searchParams]);
    
    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    // Auto-focus input
    useEffect(() => {
        inputRef.current?.focus();
    }, []);
    
    const fetchRecentSessions = async () => {
        try {
            const data = await sessionApi.getUserSessions();
            // Backend transforms _id to id, so normalize to _id and filter valid sessions
            const validSessions = (data.sessions || [])
                .map(s => ({ ...s, _id: s._id || s.id }))
                .filter(s => s && s._id);
            setRecentSessions(validSessions.slice(0, 5));
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        }
    };
    
    const loadSessionContext = async (sessionId) => {
        try {
            const data = await sessionApi.get(sessionId);
            setCurrentSessionId(sessionId);
            setSessionData(data.session);
            toast.success('Session context loaded');
            
            // Add system message
            setMessages(prev => [...prev, {
                id: generateMessageId(),
                role: 'system',
                content: `Context loaded: "${data.session.ideaText.substring(0, 60)}..." (${data.session.domainHint})`,
                timestamp: new Date().toISOString()
            }]);
        } catch (error) {
            console.error('Failed to load session:', error);
            toast.error('Failed to load session context');
        }
    };
    
    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!inputMessage.trim() || isTyping) return;
        
        const userMessage = {
            id: generateMessageId(),
            role: 'user',
            content: inputMessage.trim(),
            timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);
        
        try {
            // Call chat API
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    message: userMessage.content,
                    sessionId: currentSessionId,
                    conversationHistory: messages.slice(-6).map(m => ({
                        role: m.role === 'user' ? 'user' : 'assistant',
                        content: m.content
                    }))
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to get response');
            }
            
            const data = await response.json();
            
            const assistantMessage = {
                id: generateMessageId(),
                role: 'assistant',
                content: data.reply,
                timestamp: data.timestamp,
                context: data.context,
                inScope: data.inScope
            };
            
            setMessages(prev => [...prev, assistantMessage]);
            
        } catch (error) {
            console.error('Chat error:', error);
            toast.error('Failed to get response. Please try again.');
            
            setMessages(prev => [...prev, {
                id: generateMessageId(),
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
                timestamp: new Date().toISOString(),
                error: true
            }]);
        } finally {
            setIsTyping(false);
        }
    };
    
    const handleClearChat = () => {
        if (window.confirm('Clear all messages? This cannot be undone.')) {
            setMessages([{
                id: generateMessageId(),
                role: 'assistant',
                content: "Chat cleared. How can I help you today?",
                timestamp: new Date().toISOString()
            }]);
            setCurrentSessionId(null);
            setSessionData(null);
            toast.success('Chat cleared');
        }
    };
    
    const handleExportChat = () => {
        const chatText = messages.map(m => {
            const time = new Date(m.timestamp).toLocaleTimeString();
            const role = m.role === 'user' ? 'You' : 'SUS AI';
            return `[${time}] ${role}: ${m.content}`;
        }).join('\n\n');
        
        const blob = new Blob([chatText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sus-ai-chat-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Chat exported');
    };
    
    const suggestedQuestions = [
        "How does this platform work?",
        "Explain the 8 modules",
        "What is the risk score?",
        "How to regenerate modules?",
        "Explain my market analysis"
    ];
    
    return (
        <div 
            className="min-h-screen"
            style={{ 
                backgroundColor: 'var(--color-bg-secondary)',
                paddingTop: 'var(--space-6)',
                paddingBottom: 'var(--space-6)',
                paddingLeft: 'var(--space-6)',
                paddingRight: 'var(--space-6)'
            }}
        >
            <div className="max-w-7xl mx-auto w-full flex gap-6" style={{ height: 'calc(100vh - 6rem)' }}>
                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col" style={{ minWidth: 0 }}>
                    {/* Header */}
                    <div 
                        className="card"
                        style={{
                            padding: 'var(--space-6)',
                            marginBottom: 'var(--space-4)',
                            borderRadius: 'var(--radius-xl)',
                            background: 'linear-gradient(135deg, var(--color-bg-card) 0%, var(--color-bg-secondary) 100%)',
                            border: '2px solid var(--color-border)',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: 'var(--radius-xl)',
                                    background: 'var(--gradient-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: 'var(--shadow-md)'
                                }}>
                                    <Bot className="w-7 h-7" style={{ color: 'white' }} />
                                </div>
                                <div>
                                    <h1 style={{ 
                                        fontSize: 'var(--font-size-h2)',
                                        fontWeight: 'var(--font-weight-bold)',
                                        color: 'var(--color-text-primary)',
                                        marginBottom: 'var(--space-1)'
                                    }}>
                                        SUS AI Assistant
                                    </h1>
                                    <p style={{ 
                                        fontSize: 'var(--font-size-body)',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        Your Startup Co-Pilot
                                    </p>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleExportChat}
                                    className="btn-ghost"
                                    style={{
                                        padding: 'var(--space-3)',
                                        borderRadius: 'var(--radius-lg)'
                                    }}
                                    title="Export chat"
                                >
                                    <Download style={{ width: '20px', height: '20px' }} />
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleClearChat}
                                    className="btn-ghost"
                                    style={{
                                        padding: 'var(--space-3)',
                                        borderRadius: 'var(--radius-lg)'
                                    }}
                                    title="Clear chat"
                                >
                                    <Trash2 style={{ width: '20px', height: '20px' }} />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Messages Container */}
                    <div 
                        className="card flex-1"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            borderRadius: 'var(--radius-xl)',
                            border: '2px solid var(--color-border)'
                        }}
                    >
                        {/* Messages */}
                        <div 
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: 'var(--space-6)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-4)'
                            }}
                        >
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}
                        
                        {isTyping && (
                            <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--gradient-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <Bot style={{ width: '20px', height: '20px', color: 'white' }} />
                                </div>
                                <div style={{
                                    padding: 'var(--space-4)',
                                    borderRadius: 'var(--radius-lg)',
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    border: '2px solid var(--color-border)'
                                }}>
                                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                        <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms', color: 'var(--color-primary)' }}></span>
                                        <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms', color: 'var(--color-primary)' }}></span>
                                        <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms', color: 'var(--color-primary)' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Suggested Questions - Collapsible */}
                    {messages.length === 1 && (
                        <AnimatePresence>
                            {!isSuggestionsCollapsed && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        overflow: 'hidden',
                                        borderTop: '2px solid var(--color-border)'
                                    }}
                                >
                                    <div style={{
                                        padding: 'var(--space-4) var(--space-6)',
                                        backgroundColor: 'var(--color-bg-secondary)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                                            <p style={{ 
                                                fontSize: 'var(--font-size-body-sm)',
                                                fontWeight: 'var(--font-weight-medium)',
                                                color: 'var(--color-text-muted)',
                                                margin: 0
                                            }}>
                                                💡 Suggested questions:
                                            </p>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setIsSuggestionsCollapsed(true)}
                                                className="btn-ghost"
                                                style={{
                                                    padding: 'var(--space-1)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--color-text-muted)'
                                                }}
                                                title="Hide suggestions"
                                            >
                                                Hide
                                            </motion.button>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                            {suggestedQuestions.map((q, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setInputMessage(q)}
                                                    className="btn-ghost"
                                                    style={{
                                                        padding: 'var(--space-2) var(--space-4)',
                                                        fontSize: 'var(--font-size-body-sm)',
                                                        borderRadius: 'var(--radius-full)',
                                                        border: '2px solid var(--color-border)',
                                                        transition: 'all var(--transition-base)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                                                        e.currentTarget.style.color = 'var(--color-primary)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = 'var(--color-border)';
                                                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                                                    }}
                                                >
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                    
                    {/* Show suggestions button when collapsed */}
                    {messages.length === 1 && isSuggestionsCollapsed && (
                        <div style={{
                            padding: 'var(--space-2) var(--space-6)',
                            borderTop: '2px solid var(--color-border)',
                            backgroundColor: 'var(--color-bg-secondary)',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsSuggestionsCollapsed(false)}
                                className="btn-ghost"
                                style={{
                                    padding: 'var(--space-2) var(--space-4)',
                                    fontSize: 'var(--font-size-body-sm)',
                                    color: 'var(--color-text-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-2)'
                                }}
                            >
                                <span>💡</span>
                                <span>Show suggested questions</span>
                            </motion.button>
                        </div>
                    )}
                    
                    {/* Input */}
                    <form onSubmit={handleSendMessage}>
                        <div style={{
                            padding: 'var(--space-4) var(--space-6)',
                            borderTop: '2px solid var(--color-border)',
                            backgroundColor: 'var(--color-bg-card)'
                        }}>
                            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Ask me anything about the platform or your startup..."
                                    style={{
                                        flex: 1,
                                        padding: 'var(--space-4)',
                                        fontSize: 'var(--font-size-body)',
                                        borderRadius: 'var(--radius-xl)',
                                        border: '2px solid var(--color-border)',
                                        backgroundColor: 'var(--color-bg-secondary)',
                                        color: 'var(--color-text-primary)',
                                        outline: 'none',
                                        transition: 'all var(--transition-base)'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                                    maxLength={1000}
                                />
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    disabled={!inputMessage.trim() || isTyping}
                                    className="btn-primary"
                                    style={{
                                        padding: 'var(--space-4) var(--space-6)',
                                        borderRadius: 'var(--radius-xl)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-2)',
                                        opacity: (!inputMessage.trim() || isTyping) ? 0.5 : 1
                                    }}
                                >
                                    <Sparkles style={{ width: '20px', height: '20px' }} />
                                    <span>Send</span>
                                </motion.button>
                            </div>
                        </div>
                    </form>
                    </div>
                </div>
                
                {/* Context Sidebar - Collapsible */}
                <AnimatePresence>
                    {!isPanelCollapsed && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: '360px', opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="card"
                            style={{
                                overflow: 'hidden',
                                borderRadius: 'var(--radius-xl)',
                                border: '2px solid var(--color-border)',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <div style={{
                                padding: 'var(--space-5)',
                                borderBottom: '2px solid var(--color-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: 'var(--color-bg-secondary)'
                            }}>
                                <h3 style={{ 
                                    fontSize: 'var(--font-size-h4)',
                                    fontWeight: 'var(--font-weight-semibold)',
                                    color: 'var(--color-text-primary)',
                                    margin: 0
                                }}>
                                    Context
                                </h3>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsPanelCollapsed(true)}
                                    className="btn-ghost"
                                    style={{
                                        padding: 'var(--space-2)',
                                        borderRadius: 'var(--radius-md)'
                                    }}
                                    aria-label="Collapse panel"
                                >
                                    <ChevronRight style={{ width: '20px', height: '20px' }} />
                                </motion.button>
                            </div>
                            
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: 'var(--space-5)'
                            }}>
                                {sessionData ? (
                                    <div style={{ marginBottom: 'var(--space-6)' }}>
                                        <div 
                                            style={{
                                                padding: 'var(--space-4)',
                                                borderRadius: 'var(--radius-lg)',
                                                backgroundColor: 'var(--color-bg-secondary)',
                                                border: '2px solid var(--color-border)'
                                            }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-2)',
                                                marginBottom: 'var(--space-3)'
                                            }}>
                                                <span style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'var(--color-success)',
                                                    display: 'inline-block'
                                                }}></span>
                                                <span style={{ 
                                                    fontSize: 'var(--font-size-body-sm)',
                                                    fontWeight: 'var(--font-weight-semibold)',
                                                    color: 'var(--color-success)'
                                                }}>
                                                    Active Session
                                                </span>
                                            </div>
                                            <p style={{ 
                                                fontSize: 'var(--font-size-body-sm)',
                                                color: 'var(--color-text-primary)',
                                                lineHeight: '1.5',
                                                marginBottom: 'var(--space-3)'
                                            }}>
                                                {sessionData.ideaText.substring(0, 120)}...
                                            </p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                                                <span style={{
                                                    padding: 'var(--space-1) var(--space-3)',
                                                    borderRadius: 'var(--radius-full)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    fontWeight: 'var(--font-weight-medium)',
                                                    backgroundColor: 'var(--color-bg-tertiary)',
                                                    color: 'var(--color-text-muted)',
                                                    border: '1px solid var(--color-border)'
                                                }}>
                                                    {sessionData.domainHint}
                                                </span>
                                                <span style={{
                                                    padding: 'var(--space-1) var(--space-3)',
                                                    borderRadius: 'var(--radius-full)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    fontWeight: 'var(--font-weight-medium)',
                                                    backgroundColor: 'var(--color-success-bg)',
                                                    color: 'var(--color-success)',
                                                    border: '1px solid var(--color-success)'
                                                }}>
                                                    {sessionData.status}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setCurrentSessionId(null);
                                                    setSessionData(null);
                                                    toast.info('Context cleared');
                                                }}
                                                className="btn-ghost"
                                                style={{
                                                    fontSize: 'var(--font-size-body-sm)',
                                                    padding: 'var(--space-2) var(--space-3)',
                                                    color: 'var(--color-primary)',
                                                    width: '100%'
                                                }}
                                            >
                                                Clear context
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        style={{
                                            padding: 'var(--space-5)',
                                            borderRadius: 'var(--radius-lg)',
                                            backgroundColor: 'var(--color-bg-secondary)',
                                            border: '2px dashed var(--color-border)',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <p style={{ 
                                            fontSize: 'var(--font-size-body-sm)',
                                            color: 'var(--color-text-muted)'
                                        }}>
                                            No session loaded. Select one below.
                                        </p>
                                    </div>
                                )}
                                
                                {/* Recent Sessions */}
                                <div style={{ marginTop: 'var(--space-6)' }}>
                                    <h3 style={{ 
                                        fontSize: 'var(--font-size-body-sm)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: 'var(--space-3)'
                                    }}>
                                        Recent Sessions
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                        {recentSessions.filter(s => s && s._id).map((session) => (
                                            <button
                                                key={session._id}
                                                onClick={() => loadSessionContext(session._id)}
                                                style={{
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    padding: 'var(--space-3)',
                                                    borderRadius: 'var(--radius-lg)',
                                                    backgroundColor: currentSessionId === session._id ? 'var(--color-primary-bg)' : 'transparent',
                                                    border: `2px solid ${currentSessionId === session._id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                                    cursor: 'pointer',
                                                    transition: 'all var(--transition-base)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (currentSessionId !== session._id) {
                                                        e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                                                        e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (currentSessionId !== session._id) {
                                                        e.currentTarget.style.borderColor = 'var(--color-border)';
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }
                                                }}
                                            >
                                                <p style={{ 
                                                    fontSize: 'var(--font-size-body-sm)',
                                                    color: 'var(--color-text-primary)',
                                                    lineHeight: '1.4',
                                                    marginBottom: 'var(--space-2)',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {session.ideaText}
                                                </p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    <Clock style={{ width: '12px', height: '12px', color: 'var(--color-text-muted)' }} />
                                                    <span style={{ 
                                                        fontSize: 'var(--font-size-xs)',
                                                        color: 'var(--color-text-muted)'
                                                    }}>
                                                        {session.domainHint}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* Toggle Button (when collapsed) */}
                {isPanelCollapsed && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setIsPanelCollapsed(false)}
                        className="btn-primary"
                        style={{
                            position: 'fixed',
                            right: 'var(--space-6)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            padding: 'var(--space-3)',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-xl)',
                            zIndex: 50
                        }}
                        aria-label="Open context panel"
                    >
                        <ChevronLeft style={{ width: '24px', height: '24px' }} />
                    </motion.button>
                )}
            </div>
        </div>
    );
}

// Message Bubble Component
function MessageBubble({ message }) {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    
    if (isSystem) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', margin: 'var(--space-4) 0' }}>
                <span style={{
                    padding: 'var(--space-2) var(--space-4)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'var(--font-weight-medium)',
                    backgroundColor: 'var(--color-bg-tertiary)',
                    color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)'
                }}>
                    ℹ️ {message.content}
                </span>
            </div>
        );
    }
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{
                display: 'flex',
                alignItems: 'start',
                gap: 'var(--space-3)',
                flexDirection: isUser ? 'row-reverse' : 'row'
            }}
        >
            {!isUser && (
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--gradient-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <Bot style={{ width: '20px', height: '20px', color: 'white' }} />
                </div>
            )}
            
            <div style={{
                maxWidth: '70%',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)'
            }}>
                <div style={{
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-xl)',
                    ...(isUser ? {
                        background: 'var(--gradient-primary)',
                        color: 'white',
                        borderBottomRightRadius: 'var(--radius-sm)'
                    } : {
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '2px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        borderBottomLeftRadius: 'var(--radius-sm)'
                    }),
                    ...(message.error ? {
                        border: '2px solid var(--color-error)',
                        backgroundColor: 'var(--color-error-bg)'
                    } : {})
                }}>
                    <p style={{ 
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6',
                        margin: 0,
                        fontSize: 'var(--font-size-body)'
                    }}>
                        {message.content}
                    </p>
                </div>
                
                {!isUser && message.context && (
                    <span style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-muted)',
                        paddingLeft: 'var(--space-2)'
                    }}>
                        {message.context === 'session' ? '📊 Session context' : '💡 General knowledge'}
                    </span>
                )}
            </div>
        </motion.div>
    );
}

export default AIAssistant;
