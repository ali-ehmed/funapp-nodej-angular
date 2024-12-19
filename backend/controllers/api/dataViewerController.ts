import { Request, Response, NextFunction } from "express";
import dataViewer from "../../lib/dataViewer/dataViewer";

import { paginationParams } from "../helpers";

const mockData: Record<string, any[]> = {
  organizations: [
    { id: 1, name: "Organization A", created_at: "2024-01-01" },
    { id: 2, name: "Organization B", created_at: "2024-01-02" },
    { id: 3, name: "Organization C", created_at: "2024-01-03" },
  ],
  repositories: [
    { id: 1, name: "Repo A", owner: "Org A" },
    { id: 2, name: "Repo B", owner: "Org B" },
    { id: 3, name: "Repo C", owner: "Org C" },
  ],
};

// GET /api/:integration/data-viewer/:collection
export const getCollectionsData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { collection } = req.params;
    const { search = "" } = req.query;
    const { page, perPage: pageSize } = paginationParams(req);

    // Validate if the collection exists in mockData
    if (!mockData[collection]) {
      res.status(404).json({ error: `Collection '${collection}' not found.` });
      return;
    }

    // Fetch data for the specified collection
    const totalDataSize = mockData[collection].length;
    let data = mockData[collection];

    // Apply search filter
    if (search) {
      data = data.filter((item) =>
        Object.values(item).some((value: any) =>
          value.toString().toLowerCase().includes((search as string).toLowerCase())
        )
      );
    }

    // Pagination logic
    const startIndex = (page - 1) * pageSize;
    const paginatedData = data.slice(startIndex, startIndex + parseInt(pageSize as unknown as string, 10));

    // Dynamically generate columns
    const columns =
      data.length > 0
        ? Object.keys(data[0]).map((field) => ({
            field,
            headerName: field.replace("_", " ").toUpperCase(),
          }))
        : [];

    // Set the paginated data in res.locals for the pagination middleware
    res.locals.paginatedData = {
      columns,
      rows: paginatedData,
    };
    res.locals.totalCount = totalDataSize;

    next();
  } catch (error) {
    console.error(`Error fetching ${req.params.collection} data:`, error);
    res.status(500).json({ message: `Failed to fetch ${req.params.collection} data` });
  }
};

// GET /api/:integration/data-viewer/:collection (New Implementation)
export const getDataNew = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { collection } = req.params;
  const { search = "", filters = "{}", sort: sortAttr, sortOrder = "asc" } = req.query;
  const { page, perPage } = paginationParams(req);

  try {
    // Fetch data using dataViewer
    const { columns, rows, totalRecords } = await dataViewer(collection, {
      search: search as string,
      filters: JSON.parse(filters as string),
      sort: sortAttr as string,
      sortOrder: sortOrder as string,
      page: parseInt(page as unknown as string, 10),
      perPage: parseInt(perPage as unknown as string, 10),
    });

    res.locals.paginatedData = { columns, rows };
    res.locals.totalCount = totalRecords;

    next();
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch data" });
  }
};
