// Pagination Middleware for handling pagination metadata
function paginationMiddleware(req, res, next) {
  try {
    // Get page and perPage from query, default to 1 and 10 if not provided
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    // Attach pagination params to the request object for the controller to use
    req.pagination = { page, perPage };

    next();
  } catch (error) {
    console.error('Error in pagination middleware:', error);
    return res.status(500).json({ message: 'Pagination error' });
  }
};

module.exports = paginationMiddleware;
