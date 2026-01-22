import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Toast Notification System
 * Professional toast notifications with auto-dismiss, stacking, and accessibility
 */

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

let toastId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ type = 'info', message, duration = 4000 }) => {
        const id = toastId++;
        const toast = { id, type, message, duration };

        setToasts((prev) => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const toast = {
        success: (message, duration) => addToast({ type: 'success', message, duration }),
        error: (message, duration) => addToast({ type: 'error', message, duration }),
        warning: (message, duration) => addToast({ type: 'warning', message, duration }),
        info: (message, duration) => addToast({ type: 'info', message, duration }),
    };

    return (
        <ToastContext.Provider value={{ toast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, removeToast }) {
    return (
        <div
            style={{
                position: 'fixed',
                bottom: 'var(--space-6)',
                right: 'var(--space-6)',
                zIndex: 'var(--z-toast)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                maxWidth: '420px',
                width: '100%',
            }}
            // ARIA live region for screen reader announcements
            aria-live="polite"
            aria-atomic="true"
        >
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

function ToastItem({ toast, onClose }) {
    const config = {
        success: {
            icon: CheckCircle,
            bgColor: 'var(--color-success-bg)',
            borderColor: 'var(--color-success)',
            iconColor: 'var(--color-success)',
        },
        error: {
            icon: XCircle,
            bgColor: 'var(--color-error-bg)',
            borderColor: 'var(--color-error)',
            iconColor: 'var(--color-error)',
        },
        warning: {
            icon: AlertCircle,
            bgColor: 'var(--color-warning-bg)',
            borderColor: 'var(--color-warning)',
            iconColor: 'var(--color-warning)',
        },
        info: {
            icon: Info,
            bgColor: 'var(--color-info-bg)',
            borderColor: 'var(--color-info)',
            iconColor: 'var(--color-info)',
        },
    };

    const { icon: Icon, bgColor, borderColor, iconColor } = config[toast.type];

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
            }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
                background: 'var(--color-bg-card)',
                border: `1px solid ${borderColor}`,
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
                overflow: 'hidden',
            }}
            role="alert"
            aria-live="assertive"
        >
            {/* Colored background indicator */}
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    background: borderColor,
                }}
            />

            {/* Icon */}
            <Icon
                style={{
                    width: '20px',
                    height: '20px',
                    color: iconColor,
                    flexShrink: 0,
                }}
            />

            {/* Message */}
            <p
                style={{
                    flex: 1,
                    fontSize: 'var(--font-size-body-sm)',
                    lineHeight: 'var(--line-height-relaxed)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                }}
            >
                {toast.message}
            </p>

            {/* Close button */}
            <button
                onClick={onClose}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    padding: 0,
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    transition: 'all var(--transition-base)',
                    flexShrink: 0,
                }}
                aria-label="Close notification"
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-bg-hover)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-muted)';
                }}
            >
                <X style={{ width: '16px', height: '16px' }} />
            </button>
        </motion.div>
    );
}
