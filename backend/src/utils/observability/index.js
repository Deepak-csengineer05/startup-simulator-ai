import winston from 'winston';
import client from 'prom-client';

/* ------------------------------------------------------------------
   PROMETHEUS REGISTRY
------------------------------------------------------------------- */
export const register = new client.Registry();

// Collect default Node.js metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({ register });

const { Counter, Histogram } = client;

/* ------------------------------------------------------------------
   WINSTON LOGGER
------------------------------------------------------------------- */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'startup-simulator' },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 10,
    }),
  ],
});

// Console logging for non-production
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

/* ------------------------------------------------------------------
   PROMETHEUS METRICS
------------------------------------------------------------------- */
export const metrics = {
  // Gemini API metrics
  geminiRequests: new Counter({
    name: 'gemini_requests_total',
    help: 'Total number of Gemini API requests',
    labelNames: ['model', 'function', 'status'],
    registers: [register],
  }),

  geminiResponseTime: new Histogram({
    name: 'gemini_response_time_seconds',
    help: 'Gemini API response time in seconds',
    labelNames: ['model', 'function'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
    registers: [register],
  }),

  geminiErrors: new Counter({
    name: 'gemini_errors_total',
    help: 'Total number of Gemini API errors',
    labelNames: ['model', 'function', 'error_type'],
    registers: [register],
  }),

  geminiTokenUsage: new Counter({
    name: 'gemini_tokens_total',
    help: 'Total tokens used in Gemini API',
    labelNames: ['model', 'function'],
    registers: [register],
  }),

  // Business metrics
  userSessions: new Counter({
    name: 'user_sessions_total',
    help: 'Total number of user sessions',
    labelNames: ['plan'],
    registers: [register],
  }),

  // System / HTTP metrics
  apiRequests: new Counter({
    name: 'api_requests_total',
    help: 'Total API requests',
    labelNames: ['method', 'route', 'status'],
    registers: [register],
  }),

  apiResponseTime: new Histogram({
    name: 'api_response_time_seconds',
    help: 'API response time in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    registers: [register],
  }),
};

/* ------------------------------------------------------------------
   EXPRESS METRICS MIDDLEWARE  ✅ (THIS FIXES YOUR ERROR)
------------------------------------------------------------------- */
export const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;

    // Avoid high-cardinality labels
    const route = req.route?.path || req.path;

    const status = res.statusCode >= 400 ? 'error' : 'success';

    if (req.path === '/favicon.ico') return;


    metrics.apiRequests
      .labels(req.method, route, status)
      .inc();

    metrics.apiResponseTime
      .labels(req.method, route)
      .observe(duration);
  });

  next();
};

/* ------------------------------------------------------------------
   OBSERVABILITY HELPERS (USED BY SERVICES)
------------------------------------------------------------------- */
export const observability = {
  logRequest: (model, func, duration, success = true, tokens = 0) => {
    const status = success ? 'success' : 'error';

    metrics.geminiRequests.labels(model, func, status).inc();
    metrics.geminiResponseTime.labels(model, func).observe(duration);

    if (tokens > 0) {
      metrics.geminiTokenUsage.labels(model, func).inc(tokens);
    }

    /*logger.info('Gemini API request completed', {
      model,
      function: func,
      duration,
      status,
      tokens,
      timestamp: new Date().toISOString(),
    });*/
  },

  logError: (model, func, error, errorType = 'unknown') => {
    metrics.geminiErrors.labels(model, func, errorType).inc();

    logger.error('Gemini API error', {
      model,
      function: func,
      error: error.message,
      stack: error.stack,
      errorType,
      timestamp: new Date().toISOString(),
    });
  },

  
  recordApiRequest: (method, route, duration, statusCode) => {
    const status = statusCode >= 400 ? 'error' : 'success';

    metrics.apiRequests.labels(method, route, status).inc();
    metrics.apiResponseTime.labels(method, route).observe(duration);

    logger.http('API request', {
      method,
      route,
      duration,
      statusCode,
      timestamp: new Date().toISOString(),
    });
  },
};
