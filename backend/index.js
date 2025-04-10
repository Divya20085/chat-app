import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./src/routes/auth.route.js";
import messageRoutes from "./src/routes/message.route.js";
import { connectDB } from "./src/lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;


app.use(cors({
    origin: "http://localhost:5173",  // your frontend URL
    credentials: true                 // allow cookies/credentials
}));


app.options("*", cors({
    origin: "http://localhost:5173",
    credentials: true
}));


// In your Express app (probably in index.js or server.js)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// ✅ Middleware
app.use(express.json());
app.use(cookieParser());


// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// ✅ Start server
app.listen(PORT, () => {
    console.log("Server is running on PORT: " + PORT);
    connectDB();
});
