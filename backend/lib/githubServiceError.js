class GithubServiceError extends Error {
  constructor(message, status, details) {
    super(message); // Pass the message to the base Error class
    this.name = this.constructor.name; // Set the error name
    this.status = status || 500; // Default to 500 if no status is provided
    this.details = details; // Additional details about the error
  }
}

module.exports = GithubServiceError;
