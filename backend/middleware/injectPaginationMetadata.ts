import { Request, Response, NextFunction } from "express";

import { paginationParams } from "../controllers/helpers";

// Extend Response to include locals with pagination data
interface PaginationResponse extends Response {
  locals: {
    paginatedData?: any;
    totalCount?: number;
  };
}

// Middleware to inject pagination metadata into the response
const injectPaginationMetadata = (
  req: Request,
  res: PaginationResponse,
  next: NextFunction
): void => {
  const pagination = paginationParams(req);

  // Check if pagination metadata exists and paginated data is available
  if (pagination && res.locals.paginatedData) {
    const total = res.locals.totalCount || 0;
    const totalPages = Math.ceil(total / pagination.perPage);

    // Send the paginated response with metadata
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
    // Proceed to the next middleware or route handler
    next();
  }
};

export default injectPaginationMetadata;
