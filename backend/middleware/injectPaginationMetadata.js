function injectPaginationMetadata(req, res, next) {
  const pagination = req.pagination;

  // Check if the result was paginated and is an array
  if (pagination && res.locals.paginatedData) {
    const total = res.locals.totalCount || 0;
    const totalPages = Math.ceil(total / pagination.perPage);

    // Inject pagination metadata into the response
    res.json({
      data: res.locals.paginatedData,
      pagination: {
        page: pagination.page,
        perPage: pagination.perPage,
        total: total,
        totalPages: totalPages,
      },
    });
  } else {
    next();
  }
};

module.exports = injectPaginationMetadata;
