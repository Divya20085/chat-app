import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Initialize socket server with CORS options
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",  // Frontend URL (adjust this as necessary)
    methods: ["GET", "POST"],
    credentials: true,  // Enable credentials for cookie support
  },
});

// Store connected users' sockets in a map: { userId: socketId }
const userSocketMap = {};  // Map to track userId -> socketId

// Handle socket connection and disconnection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Get the userId from the handshake query
  const userId = socket.handshake.query.userId;  // Assuming userId is sent from frontend when socket connects

  if (userId) {
    // Store the socketId for the connected user
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socketId: ${socket.id}`);

    // Emit the updated list of online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));  // Emits the userIds of online users
  }

  // Handle socket disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    
    // Remove the user from the userSocketMap when they disconnect
    if (userId) {
      delete userSocketMap[userId];
      console.log(`User ${userId} disconnected`);
    }

    // Emit the updated list of online users after a disconnect
    io.emit("getOnlineUsers", Object.keys(userSocketMap));  // Emits the userIds of online users
  });
});

// Function to retrieve the receiver's socketId based on userId
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];  // Returns the socketId for a given userId
}

// Export the io instance, app, and server to be used in other parts of your application
export { io, app, server };
