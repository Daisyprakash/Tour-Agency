// Logging middleware
const loggerMiddleware = (req, res, next) => {
    console.log(`Request received: ${req.method} ${req.originalUrl}`);
    next();
  };
  
  module.exports = loggerMiddleware;
  