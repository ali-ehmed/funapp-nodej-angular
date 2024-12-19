import { Request, Response, NextFunction } from "express";
import dataViewer from "../../lib/dataViewer/dataViewer";

import { paginationParams } from "../helpers";

// GET /api/:integration/data-viewer/:collection
export const getCollectionsData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { collection } = req.params;
  const { page, perPage } = paginationParams(req);

  try {
    // Fetch data using dataViewer
    const { columns, rows, totalRecords } = await dataViewer(collection, {
      ...req.query,
      page,
      perPage,
    });

    res.locals.paginatedData = { columns, rows };
    res.locals.totalCount = totalRecords;

    next();
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch data" });
  }
};
