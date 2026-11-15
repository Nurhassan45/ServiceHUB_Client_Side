import axiosInstance from "./axios";

export const testAPI = async () => {
    const response = await axiosInstance.get("/services");

    return response.data;
};