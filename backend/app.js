require('dotenv').config({ path: './backend/.env' });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import routes
const authRoutes = require('./routes/authRoutes');
const githubAuthRoutes = require('./routes/githubAuthRoutes');

// MongoDB connection setup
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Use routes
app.use('/api/auth', authRoutes);
app.use('/auth', githubAuthRoutes);

// MongoDB connection
connectDB();

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
