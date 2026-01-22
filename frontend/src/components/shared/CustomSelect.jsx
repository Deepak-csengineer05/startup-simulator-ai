import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/**
 * CustomSelect Component
 * Modern dropdown select with animations and custom styling
 * 
 * @param {string} label - Label text above the select
 * @param {string} value - Currently selected value
 * @param {function} onChange - Callback when selection changes
 * @param {array} options - Array of option values
 * @param {boolean} disabled - Whether the select is disabled
 * @param {string} placeholder - Placeholder text (optional)
 */
function CustomSelect({ label, value, onChange, options, disabled = false, placeholder = 'Select...' }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div style={{ marginBottom: 'var(--space-3)' }} ref={selectRef}>
            {/* Label */}
            {label && (
                <label
                    className="font-medium"
                    style={{
                        fontSize: 'var(--font-size-body-sm)',
                        color: 'var(--color-text-secondary)',
                        marginBottom: 'var(--space-2)',
                        display: 'block',
                    }}
                >
                    {label}
                </label>
            )}

            {/* Select Trigger Button */}
            <div style={{ position: 'relative' }}>
                <motion.button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className="w-full"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)',
                        background: disabled ? 'var(--color-bg-secondary)' : 'var(--color-bg-card)',
                        color: value ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                        fontSize: 'var(--font-size-body-sm)',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: disabled ? 0.6 : 1,
                    }}
                    whileTap={!disabled ? { scale: 0.98 } : {}}
                    onMouseEnter={(e) => {
                        if (!disabled) {
                            e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!disabled) {
                            e.currentTarget.style.borderColor = 'var(--color-border)';
                        }
                    }}
                >
                    <span>{value || placeholder}</span>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: 'flex', alignItems: 'center' }}
                    >
                        <ChevronDown style={{ width: '18px', height: '18px', color: 'var(--color-text-muted)' }} />
                    </motion.div>
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: 'absolute',
                                top: 'calc(100% + var(--space-1))',
                                left: 0,
                                right: 0,
                                zIndex: 50,
                                background: 'var(--color-bg-card)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: 'var(--shadow-lg)',
                                maxHeight: '240px',
                                overflowY: 'auto',
                                padding: 'var(--space-2)',
                            }}
                        >
                            {options.map((option) => (
                                <motion.button
                                    key={option}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className="w-full text-left"
                                    style={{
                                        padding: 'var(--space-2) var(--space-3)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: 'var(--font-size-body[sm])',
                                        color: option === value ? 'var(--color-primary)' : 'var(--color-text-primary)',
                                        background: option === value ? 'var(--color-bg-hover)' : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        border: 'none',
                                        fontWeight: option === value ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                                        marginBottom: 'var(--space-1)',
                                    }}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onMouseEnter={(e) => {
                                        if (option !== value) {
                                            e.currentTarget.style.background = 'var(--color-bg-hover)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (option !== value) {
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    {option}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default CustomSelect;
