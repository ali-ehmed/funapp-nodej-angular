import { Request, Response, NextFunction } from "express";
import dataViewer, { isValidCollectionName } from "../../lib/dataViewer/dataViewer";

import { Document } from "mongoose";

import { paginationParams } from "../helpers";

import ModelConfigSchema from "../../lib/modelConfig/modelConfig";
import { ModelConfig } from "../../lib/modelConfig/types";

// GET /api/:integration/data-viewer/:collection
// Fetch data for a collection
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

// GET /api/:integration/distinct-values/:collection/:field
// Fetch distinct values for a field in a collection
//
export const getDistinctValues = async (req: Request, res: Response) => {
  const { collection: collectionName, field } = req.params;

  try {
    if (!isValidCollectionName(collectionName)) {
      throw new Error(`Collection '${collectionName}' is not valid.`);
    }

    // Fetch model configuration
    const modelConfig = ModelConfigSchema[collectionName] as ModelConfig<Document>;
    if (!modelConfig) {
      throw new Error(`Collection '${collectionName}' not found.`);
    }

    const Model = modelConfig.model;
    const distinctValues = await Model.distinct(field); // Fetch distinct values
    res.json(distinctValues);
  } catch (err) {
    res.status(500).send('Error fetching distinct values');
  }
}
