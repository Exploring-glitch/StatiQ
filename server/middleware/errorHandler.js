// 404 for unknown /api routes
export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not found — ${req.originalUrl}`));
}

// Central error formatter (must be last middleware)
export function errorHandler(err, req, res, _next) {
  // Multer upload failures (too big, wrong type) → 400, not 500.
  if (err?.name === 'MulterError' || /only (pdf|doc|docx|jpg|jpeg|png|webp)|no file received/i.test(err?.message || '')) {
    res.status(400);
  } else if (err?.name === 'ValidationError' || err?.name === 'CastError') {
    // Mongoose schema / cast failures are client errors, not crashes.
    if (res.statusCode === 200) res.status(400);
  }
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    message: err.message || 'Server error',
    // Stack traces only in explicit development — never by default.
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
