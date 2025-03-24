# Fun app - Connect GitHub using OAuth

This is a fun app to showcase my nodeJS and AngularJS skills. It involves connecting to GitHub using OAuth to authenticate a user, retrieve their GitHub profile data, and use that data for authentication and management in the backend.

## Tech Stack

- **Node.js (Version 20)** - Backend
- **Express.js** - Backend Framework
- **MongoDB** - Database
- **Angular** - Frontend Framework
- **Docker** - For running MongoDB

## Features

- GitHub OAuth authentication.
- User authentication and profile viewing.
- MongoDB is used for storing user data.
- Backend built with Node.js and Express.js.
- Frontend built with Angular.

## Installation

### Prerequisites

- **Docker** (Version 26)
- **Docker Compose** (Version 2.25)

Docker is used to run the MongoDB server, so you don't need to install it locally.

### Steps

1. **Clone the Repository**

   First, clone the repository:

   ```bash
   git clone git@github.com:ali-ehmed/funapp-nodej-angular.git
   ```

2. **Install Dependencies**

   - Navigate to the project root directory and install dependencies for both the backend and frontend:

     ```bash
     npm install
     ```

   - Go to the backend directory and install dependencies:

     ```bash
     cd backend && npm install && cd ..
     ```

   - Go to the frontend directory and install dependencies:

     ```bash
     cd frontend && npm install && cd ..
     ```

3. **Run MongoDB with Docker**

   - In the first terminal window/tab, run the MongoDB Docker container:

     ```bash
     npm run start:db
     ```

   This will start a MongoDB server using Docker. You do not need to install MongoDB locally.

4. **Run the Frontend Development Server**

   - In another terminal window/tab, run the development server for both angular and nodejs:

     ```bash
     npm start
     ```

   This will start the frontend server at `http://localhost:4200` and backend server at `http://localhost:3000`.

5. **Access the Application**

   - Open your browser and go to `http://localhost:4200` to view the application.

## Environment Variables

The application uses environment variables for configuration. Make sure you have the following set up in your `.env` file:

- **GITHUB_CLIENT_ID**: The Client ID from GitHub OAuth App.
- **GITHUB_CLIENT_SECRET**: The Client Secret from GitHub OAuth App.
- **FRONTEND_URL**: The URL of the frontend (typically `http://localhost:4200`).
- **JWT_SECRET**: Secret for Json Web Token

### Running MongoDB using Docker

You can run MongoDB using the provided Docker Compose setup. Docker will automatically handle the database without needing any local installation.

### Docker Compose Version

- **Docker**: Version 26
- **Docker Compose**: Version 2.25

## Folder Structure

```plaintext
sredio-test-task/
├── backend/          # Backend (Node.js + Express)
│   ├── controllers/  # Controller files
│   ├── services/     # Service files (GitHub authentication, etc.)
│   └── models/       # MongoDB models
│
├── frontend/         # Frontend (Angular)
│   ├── src/
│   └── package.json
│
├── docker-compose.yml
├── package.json      # Root package file for common dependencies
└── README.md         # This file
```

## Troubleshooting

- **MongoDB connection issues**: Ensure that Docker is running and MongoDB is started with the `npm run start:db` command.
- **Frontend build issues**: Make sure all dependencies are correctly installed in the `frontend` directory. Run `npm install` again if necessary.
