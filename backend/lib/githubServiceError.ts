class GithubServiceError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status?: number, details?: any) {
    super(message); // Pass the message to the base Error class
    this.name = this.constructor.name; // Set the error name
    this.status = status || 500; // Default to 500 if no status is provided
    this.details = details; // Additional details about the error

    // Ensure the prototype chain is properly set (important for extending built-ins in TS)
    Object.setPrototypeOf(this, GithubServiceError.prototype);
  }
}

export default GithubServiceError;
