import axios from "axios";
export const axiosInstance = axios.create({
    baseURL:"http://localhost:5008/api",
    withCredentials:true,
    
})