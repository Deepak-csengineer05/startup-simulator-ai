export function validateInput(schema, data) {
    const errors = [];
    
    for (const [key, config] of Object.entries(schema)) {
        const value = data[key];
        
        if (config.required && (value === undefined || value === null || value === '')) {
            errors.push(`${key} is required`);
            continue;
        }
        
        if (value !== undefined && value !== null) {
            if (config.type === 'string') {
                if (typeof value !== 'string') {
                    errors.push(`${key} must be a string`);
                } else if (config.maxLength && value.length > config.maxLength) {
                    errors.push(`${key} exceeds maximum length of ${config.maxLength}`);
                } else if (config.minLength && value.length < config.minLength) {
                    errors.push(`${key} must be at least ${config.minLength} characters`);
                }
                
                if (config.enum && !config.enum.includes(value)) {
                    errors.push(`${key} must be one of: ${config.enum.join(', ')}`);
                }
            } else if (config.type === 'array') {
                if (!Array.isArray(value)) {
                    errors.push(`${key} must be an array`);
                } else if (config.maxItems && value.length > config.maxItems) {
                    errors.push(`${key} exceeds maximum items of ${config.maxItems}`);
                }
            } else if (config.type === 'object') {
                if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                    errors.push(`${key} must be an object`);
                }
            }
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

export function sanitizePrompt(prompt) {
    // Remove potential injection patterns
    let sanitized = prompt
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '') // Remove javascript protocol
        .replace(/data:/gi, '') // Remove data protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
    
    // Limit prompt size
    if (sanitized.length > 10000) {
        sanitized = sanitized.substring(0, 10000) + '... [truncated]';
    }
    
    return sanitized;
}