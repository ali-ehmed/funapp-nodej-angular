import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";

import dataFetcher from "../../lib/dataFetcher/dataFetcher";

import Organization from "../../models/organizationModel";
import Repository from "../../models/repositoryModel";

import { currentUser, paginationParams } from "../helpers";

import { OrganizationResponse } from "../types/api/organizationsControllerTypes";

export const getOrganizations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await currentUser(req);
    const { page, perPage } = paginationParams(req);
    const { _id: userId } = user;

    // Fetch organizations for the current user with pagination
    const { results: organizations, totalRecords } = await dataFetcher({
      model: Organization,
      filters: { user: new mongoose.Types.ObjectId(`${userId}`) },
      page,
      perPage,
    });

    // Get the total repositories count for each organization
    const response: OrganizationResponse[] = await Promise.all(
      organizations.map(async (org) => {
        const totalRepositories = await Repository.countDocuments({ organization: org._id });

        return {
          id: new mongoose.Types.ObjectId(`${org._id}`),
          avatarUrl: org.avatarUrl,
          name: org.name,
          totalRepositories, // Count of repositories in this organization
        };
      })
    );

    // Set the paginated data in res.locals for the pagination middleware
    res.locals.paginatedData = response;
    res.locals.totalCount = totalRecords;

    next();
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ message: "Failed to fetch organizations" });
  }
};
