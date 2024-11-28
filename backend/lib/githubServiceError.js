class GithubServiceError extends Error {
  constructor(message, status) {
    super(message); // Pass the message to the base Error class
    this.name = this.constructor.name; // Set the error name
    this.status = status || 500; // Default to 500 if no status is provided
  }
}

module.exports = GithubServiceError;
