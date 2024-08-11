import { create } from "zustand";
import axios from "axios";

export const API_URL =
    import.meta.env.MODE === "development"
        ? "http://localhost:3001/api/auth"
        : "/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
    user: {
        email: null,
        name: null,
        isVerified: false, // Initialize as false to avoid type errors
    },
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,
    message: null,

    errorSetter: (errorMsg) => {
        set({ error: errorMsg });
    },

    signup: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/sign-up`, {
                email,
                password,
                name,
            });
            set({
                user: {
                    ...response.data.user,
                    isVerified: response.data.user.isVerified || false,
                },
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Error signing up",
                isLoading: false,
            });
            throw error;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/sign-in`, {
                email,
                password,
            });
            set({
                user: {
                    ...response.data.user,
                    isVerified: response.data.user.isVerified || false,
                },
                isAuthenticated: true,
                error: null,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Error logging in",
                isLoading: false,
            });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`${API_URL}/logout`);
            set({
                user: {
                    email: null,
                    name: null,
                    isVerified: false,
                },
                isAuthenticated: false,
                error: null,
                isLoading: false,
            });
        } catch (error) {
            set({ error: "Error logging out", isLoading: false });
            throw error;
        }
    },

    verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/verify-email`, {
                code,
            });
            set({
                user: {
                    ...response.data.user,
                    isVerified: true, // Assuming verification sets isVerified to true
                },
                isAuthenticated: true,
                isLoading: false,
            });
            return response.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || "Error verifying email",
                isLoading: false,
            });
            throw error;
        }
    },

    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/check-auth`);
            set({
                user: {
                    ...response.data.user,
                    isVerified: response.data.user.isVerified || false,
                },
                isAuthenticated: true,
                isCheckingAuth: false,
            });
        } catch (error) {
            console.error("Authentication check failed:", error);
            set({
                user: {
                    email: null,
                    name: null,
                    isVerified: false,
                },
                isAuthenticated: false,
                isCheckingAuth: false,
            });
        }
    },

    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/forget-password`, {
                email,
            });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error:
                    error.response?.data?.message ||
                    "Error sending reset password email",
            });
            throw error;
        }
    },

    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(
                `${API_URL}/reset-password/${token}`,
                { password }
            );
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error:
                    error.response?.data?.message || "Error resetting password",
            });
            throw error;
        }
    },
}));
