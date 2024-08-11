import { create } from "zustand";
import axios from "axios";

export const API_URL = import.meta.env.VITE_CLIENT_URL;

axios.defaults.withCredentials = true;

const handleRequest = async (url, method, data) => {
    try {
        const response = await axios({
            url: `${API_URL}${url}`,
            method: method,
            data: data,
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "An error occurred";
    }
};

export const useAuthStore = create((set) => ({
    user: {
        email: null,
        name: null,
        isVerified: false,
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
            const data = await handleRequest("/api/auth/sign-up", "POST", {
                email,
                password,
                name,
            });
            set({
                user: {
                    ...data.user,
                    isVerified: data.user.isVerified || false,
                },
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            set({ error, isLoading: false });
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const data = await handleRequest("/api/auth/sign-in", "POST", {
                email,
                password,
            });
            set({
                user: {
                    ...data.user,
                    isVerified: data.user.isVerified || false,
                },
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            set({ error, isLoading: false });
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await handleRequest("/api/auth/logout", "POST");
            set({
                user: {
                    email: null,
                    name: null,
                    isVerified: false,
                },
                isAuthenticated: false,
                isLoading: false,
            });
        } catch (error) {
            set({ error, isLoading: false });
        }
    },

    verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
            const data = await handleRequest("/api/auth/verify-email", "POST", {
                code,
            });
            set({
                user: { ...data.user, isVerified: true },
                isAuthenticated: true,
                isLoading: false,
            });
            return data;
        } catch (error) {
            set({ error, isLoading: false });
        }
    },

    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            const data = await handleRequest("/api/auth/check-auth", "GET");
            set({
                user: {
                    ...data.user,
                    isVerified: data.user.isVerified || false,
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
            const data = await handleRequest(
                "/api/auth/forget-password",
                "POST",
                { email }
            );
            set({ message: data.message, isLoading: false });
        } catch (error) {
            set({ error, isLoading: false });
        }
    },

    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
            const data = await handleRequest(
                `/api/auth/reset-password/${token}`,
                "POST",
                { password }
            );
            set({ message: data.message, isLoading: false });
        } catch (error) {
            set({ error, isLoading: false });
        }
    },
}));
