/**
 * Structured Logger for PostWise-AI
 * Formats log messages as structured JSON objects with level, timestamp, and metadata.
 * Automatically redacts sensitive parameters.
 */

const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'secret', 'key', 'groqapi', 'openai_api_key', 'accesstoken'];

function redactSensitiveData(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveData);
  }

  const redacted = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some(k => lowerKey.includes(k))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

function formatLog(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const cleanMeta = redactSensitiveData(meta);
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...(Object.keys(cleanMeta).length > 0 ? { meta: cleanMeta } : {}),
  });
}

const logger = {
  info: (message, meta) => {
    console.log(formatLog('INFO', message, meta));
  },
  warn: (message, meta) => {
    console.warn(formatLog('WARN', message, meta));
  },
  error: (message, meta) => {
    console.error(formatLog('ERROR', message, meta));
  },
  debug: (message, meta) => {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      console.log(formatLog('DEBUG', message, meta));
    }
  },
};

module.exports = logger;
