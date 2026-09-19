const logger = require('../utils/logger');

const validate = (schema, target = 'body') => (req, res, next) => {
  try {
    const result = schema.safeParse(req[target] || {});
    if (!result.success) {
      const errorList = result.error.issues || result.error.errors || [];
      const issues = errorList.map(err => ({
        field: Array.isArray(err.path) ? err.path.join('.') : String(err.path),
        message: err.message,
      }));
      logger.warn('Validation error', { path: req.originalUrl, issues });
      return res.status(400).json({
        message: issues[0]?.message || 'Validation error',
        errors: issues,
      });
    }
    req[target] = result.data;
    next();
  } catch (err) {
    logger.error('Unhandled validation error', { error: err.message });
    return res.status(500).json({ message: 'Internal validation server error' });
  }
};

module.exports = validate;
