import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axio";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [], // ✅ Always starts as an array
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // ✅ Fetch users
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/auth/check"); // Make sure this endpoint returns an array!
      
      // ✅ Defensive: ensure response is an array
      const usersArray = Array.isArray(res.data) ? res.data : [];
      set({ users: usersArray });

    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching users");
      set({ users: [] }); // ✅ Prevent future crashes
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Fetch messages
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      const messagesArray = Array.isArray(res.data) ? res.data : [];
      set({ messages: messagesArray });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Send a message
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending message");
    }
  },

  // Subscribe to real-time messages
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    if (!socket) {
      console.error("Socket connection is not available");
      return;
    }

    socket.on("newMessage", (newMessage) => {
      const isMessageFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  // Unsubscribe
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    } else {
      console.warn("Socket not available for unsubscribe");
    }
  },

  // Set selected user
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
