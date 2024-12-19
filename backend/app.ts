import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });

import express, { Express } from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";

// Import routes
import apiRoutes from "./routes/apiRoutes";
import githubAuthRoutes from "./routes/githubAuthRoutes";

// MongoDB connection setup
import connectDB from "./config/db";

// Initialize Express app
const app: Express = express();

// Middleware setup
const corsOptions: CorsOptions = {
	origin: "http://localhost:4200", // Allow requests from Angular app
	methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
	allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
	credentials: true, // Allow cookies to be sent
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Use routes
app.use("/api", apiRoutes);
app.use("/auth", githubAuthRoutes);

// MongoDB connection
connectDB();

// Start the server
const PORT: number = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
