/**
 * Request Logger Middleware
 * Logs incoming requests for debugging and monitoring
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log response when it finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    
    const logMessage = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    if (logLevel === 'error') {
      console.error('Request:', logMessage);
    } else {
      console.log('Request:', logMessage);
    }
  });

  next();
};
