import { Request, Response } from "express";

// Extended Request for Query Parameters
export interface GitHubAuthCallbackRequest extends Request {
  query: {
    code: string;
    state: string;
  };
}

// Response Type
export type GitHubAuthCallbackResponse = Response;
