// console.js

const connectDB = require("./config/db");
const Repository = require('./models/repositoryModel');  // Replace with the path to your model

// Connect to MongoDB (Replace with your actual DB URI)
// MongoDB connection
connectDB();

// Now you can run your queries or use your Mongoose model here
console.log(Repository.findById('67489f38e88a7c4867599d0c').fullName);