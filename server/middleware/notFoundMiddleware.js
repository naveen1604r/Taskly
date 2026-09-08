/**
 * 404 Not Found Middleware
 * Returns consistent JSON response for unknown API endpoints
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
    path: req.originalUrl,
    method: req.method,
  });
};

export default notFoundHandler;
