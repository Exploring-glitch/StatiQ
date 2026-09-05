// 404 for unknown /api routes
export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not found — ${req.originalUrl}`));
}

// Central error formatter (must be last middleware)
export function errorHandler(err, req, res, _next) {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
