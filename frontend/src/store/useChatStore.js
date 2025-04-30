import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axio";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // Fetch users for the sidebar or contacts list
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users"); // Update the correct endpoint
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Fetch messages for a selected user
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Send a message to the selected user
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending message");
    }
  },

  // Subscribe to incoming messages from the selected user
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket; // Get socket from auth store

    // Check if socket connection is available before subscribing
    if (!socket) {
      console.error("Socket connection is not available");
      return;
    }

    // Listen for new messages
    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      // Append new message to the existing messages
      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  // Unsubscribe from the incoming messages when no longer needed
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket; // Get socket from auth store

    if (socket) {
      socket.off("newMessage"); // Remove event listener for 'newMessage'
    } else {
      console.warn("Socket connection is not available to unsubscribe");
    }
  },

  // Set the currently selected user
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
