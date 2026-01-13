/**
 * Security Middleware & Utilities
 * Comprehensive security hardening for production deployment
 */

const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const mongoSanitize = require('mongo-sanitize');

// ==================== RATE LIMITING ====================

/**
 * Global rate limiter - applies to all routes
 * 100 requests per 15 minutes per IP
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipFailedRequests: false, // Count failed requests
  keyGenerator: (req) => {
    // Use X-Forwarded-For if behind proxy, otherwise use the ipKeyGenerator helper
    const forwardedFor = req.headers['x-forwarded-for']?.split(',')[0]?.trim();
    return forwardedFor || ipKeyGenerator(req);
  }
});

/**
 * Auth routes limiter - stricter for login/OTP endpoints
 * 5 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Very strict for auth endpoints
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const forwardedFor = req.headers['x-forwarded-for']?.split(',')[0]?.trim();
    return forwardedFor || ipKeyGenerator(req);
  }
});

/**
 * Captcha endpoint limiter - prevent captcha farming
 * 20 requests per 15 minutes
 */
const captchaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many captcha requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Admin routes limiter - extra protection
 * 30 requests per 15 minutes
 */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many admin requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Team selection limiter - prevent spam
 * 10 requests per hour (since they have 2 edit attempts anyway)
 */
const selectionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Too many selection attempts. Slow down!' },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Speed limiter - gradually slow down responses for repeat offenders
 */
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50, // Allow 50 requests per 15 mins without delay
  delayMs: (hits) => hits * 100, // Add 100ms delay per request after limit
  maxDelayMs: 5000 // Max delay of 5 seconds
});

// ==================== INPUT SANITIZATION ====================

/**
 * Sanitize request body, query, and params to prevent NoSQL injection
 */
function sanitizeInput(req, res, next) {
  if (req.body) req.body = mongoSanitize(req.body);
  if (req.query) req.query = mongoSanitize(req.query);
  if (req.params) req.params = mongoSanitize(req.params);
  next();
}

/**
 * Validate and sanitize string inputs
 * Removes potentially dangerous characters
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/[<>'"`;(){}[\]\\]/g, '') // Remove dangerous chars
    .trim()
    .slice(0, 500); // Limit length
}

/**
 * Deep sanitize an object (recursive)
 */
function deepSanitize(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(deepSanitize);
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key of Object.keys(obj)) {
      sanitized[sanitizeString(key)] = deepSanitize(obj[key]);
    }
    return sanitized;
  }
  return obj;
}

function deepSanitizeMiddleware(req, res, next) {
  if (req.body) req.body = deepSanitize(req.body);
  if (req.query) req.query = deepSanitize(req.query);
  if (req.params) req.params = deepSanitize(req.params);
  next();
}

// ==================== SECURITY HEADERS (HELMET) ====================

const helmetConfig = helmet({
  // Disable CSP for pure API servers (no HTML served)
  contentSecurityPolicy: false,
  // Allow resources to be loaded cross-origin (needed for captcha images)
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
});

// ==================== CORS CONFIGURATION ====================

const corsConfig = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.) in dev
    // In production, you should specify exact allowed origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  credentials: true,
  maxAge: 86400 // 24 hours
});

// ==================== BRUTE FORCE PROTECTION ====================

const failedAttempts = new Map();
const BLOCK_DURATION = 30 * 60 * 1000; // 30 minutes block
const MAX_FAILED_ATTEMPTS = 5;

function trackFailedAttempt(ip) {
  const now = Date.now();
  const record = failedAttempts.get(ip) || { count: 0, firstAttempt: now, blockedUntil: 0 };
  
  // Reset if first attempt was more than 15 minutes ago
  if (now - record.firstAttempt > 15 * 60 * 1000) {
    record.count = 1;
    record.firstAttempt = now;
  } else {
    record.count++;
  }
  
  // Block if exceeded max attempts
  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION;
  }
  
  failedAttempts.set(ip, record);
  
  // Cleanup old entries periodically
  if (failedAttempts.size > 10000) {
    for (const [key, val] of failedAttempts) {
      if (now > val.blockedUntil && now - val.firstAttempt > 60 * 60 * 1000) {
        failedAttempts.delete(key);
      }
    }
  }
}

function isBlocked(ip) {
  const record = failedAttempts.get(ip);
  if (!record) return false;
  if (Date.now() < record.blockedUntil) return true;
  return false;
}

function clearFailedAttempts(ip) {
  failedAttempts.delete(ip);
}

function bruteForceProtection(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  
  if (isBlocked(ip)) {
    return res.status(429).json({ 
      error: 'IP temporarily blocked due to too many failed attempts. Please try again later.' 
    });
  }
  
  next();
}

// ==================== REQUEST VALIDATION ====================

/**
 * Validate roll number format (alphanumeric, max 20 chars)
 */
function isValidRollNo(rollNo) {
  if (typeof rollNo !== 'string') return false;
  return /^[A-Za-z0-9]{5,20}$/.test(rollNo);
}

/**
 * Validate batch (A or B only)
 */
function isValidBatch(batch) {
  return batch === 'A' || batch === 'B';
}

/**
 * Validate session ID format
 */
function isValidSessionId(sessionId) {
  if (typeof sessionId !== 'string') return false;
  return /^[A-Za-z0-9._-]{16,128}$/.test(sessionId);
}

/**
 * Validate OTP (numeric, 4-8 digits)
 */
function isValidOTP(otp) {
  if (typeof otp !== 'string') return false;
  return /^\d{4,8}$/.test(otp);
}

/**
 * Validate captcha (alphanumeric, 4-10 chars)
 */
function isValidCaptcha(captcha) {
  if (typeof captcha !== 'string') return false;
  return /^[A-Za-z0-9]{4,10}$/.test(captcha);
}

/**
 * Validate JWT token format
 */
function isValidJWT(token) {
  if (typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => /^[A-Za-z0-9_-]+$/.test(part));
}

/**
 * Validate choices array (for team selection)
 */
function isValidChoices(choices) {
  if (!Array.isArray(choices)) return false;
  if (choices.length !== 2) return false;
  return choices.every(c => isValidRollNo(c));
}

// ==================== ERROR HANDLING ====================

/**
 * Global error handler - hide stack traces in production
 */
function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}:`, err.message);
  
  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  
  // JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  
  // Default error response
  const statusCode = err.status || err.code || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(statusCode).json({ error: message });
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Endpoint not found' });
}

// ==================== SECURITY LOGGING ====================

function securityLogger(req, res, next) {
  const start = Date.now();
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      ip,
      userAgent: req.headers['user-agent']?.slice(0, 100),
      status: res.statusCode,
      duration: `${duration}ms`
    };
    
    // Log suspicious activity
    if (res.statusCode === 401 || res.statusCode === 403 || res.statusCode === 429) {
      console.warn('[SECURITY]', JSON.stringify(log));
    }
  });
  
  next();
}

// ==================== EXPORTS ====================

module.exports = {
  // Rate limiters
  globalLimiter,
  authLimiter,
  captchaLimiter,
  adminLimiter,
  selectionLimiter,
  speedLimiter,
  
  // Sanitization
  sanitizeInput,
  deepSanitizeMiddleware,
  sanitizeString,
  
  // Security middleware
  helmetConfig,
  corsConfig,
  hpp,
  bruteForceProtection,
  
  // Brute force tracking
  trackFailedAttempt,
  clearFailedAttempts,
  
  // Validation
  isValidRollNo,
  isValidBatch,
  isValidSessionId,
  isValidOTP,
  isValidCaptcha,
  isValidJWT,
  isValidChoices,
  
  // Error handlers
  errorHandler,
  notFoundHandler,
  
  // Logging
  securityLogger
};
