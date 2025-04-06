import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);
        console.log("Decoded User ID:", decoded.userId);

        // Find user by ID and exclude password
        const user = await User.findById(decoded.userId).select("-password");
        console.log("User found:", user);

        // Check if user exists and is active
        if (!user || user.isDeactivated) {
            return res.status(401).json({ message: "User not found or deactivated" });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protectRoute middleware:", error.message);

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Unauthorized - Token Expired" });
        }

        res.status(500).json({ message: "Internal server error" });
    }
};
