import {create} from "zustand";
import { axiosInstance } from "../lib/axio";
import { toast } from "react-hot-toast"; 
export const useAuthStore = create((set) => ({
    authUser: null,
    isSigninUp: false,
    isLoggingIng: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,

    checkAuth:async()=>{
        try{
            const res=await axiosInstance.get("/auth/check");
            set({authUser:res.data})
        }
        catch(error){
            console.log("Error in checkAuth: ",error);
            set({authUser: null })
        }
        finally{
            set({isCheckingAuth:false});
        }
    },
    signup: async ({ fullName, email, password }) => {
        set({ isSigningUp: true });
        try {
          const res = await axiosInstance.post('/auth/signup', {
            fullName,
            email,
            password,
          });
      
          console.log("Signup response:", res.data); // ✅ Check if this shows
      
          set({ isSigningUp: false });
          return true; 
        } catch (err) {
          console.error("Signup error:", err.response?.data || err.message);
          set({ isSigningUp: false });
        }
      },
      login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/auth/login", data);
          set({ authUser: res.data });
          toast.success("Logged in successfully");
    
          get().connectSocket();
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isLoggingIn: false });
        }
      },
    
      logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
          set({ authUser: null });
          toast.success("Logged out successfully");
          get().disconnectSocket();
        } catch (error) {
          toast.error(error.response.data.message);
        }
      },
      updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
          const res = await axiosInstance.put("/auth/update-profile", data);
          set({ authUser: res.data });
          toast.success("Profile updated successfully");
        } catch (error) {
          console.log("error in update profile:", error);
          toast.error(error.response.data.message);
        } finally {
          set({ isUpdatingProfile: false });
        }
      },
  }));
  