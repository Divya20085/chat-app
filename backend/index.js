import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./src/routes/auth.route.js";
import messageRoutes from "./src/routes/message.route.js";
import { connectDB } from "./src/lib/db.js";
import { app, server } from "./src/lib/socket.js"; // Import server from socket.js

dotenv.config();

// Ensure PORT is set in .env file
const PORT = process.env.PORT || 5001; // Default to 5001 if not specified in .env

// Set up the CORS options
app.use(cors({
    origin: "http://localhost:5173",  // Frontend URL
    credentials: true,               // Enable credentials (cookies)
}));

app.options("*", cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware
app.use(cookieParser());

// Routes setup
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// Connect to the database
connectDB();

// Start both the HTTP and WebSocket servers
server.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});
