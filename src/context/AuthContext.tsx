
"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import axiosInstance from "../lib/axios";


type UserRole = "customer" | "technician" | "admin";

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // const [user, setUser] = useState<User | null>(null);
 const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");
    console.log('token',token);

    if (storedUser && token) {
        try {
            setUser(JSON.parse(storedUser) as User);
        } catch {
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
        }
    }

    setLoading(false);
}, []);
    // Login function
    const login = async (email: string, password: string) => {
        const response = await axiosInstance.post("/auth/login", {
            email,
            password,
        });

        const { accessToken, data } = response.data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(data));

        setUser(data);
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        setUser(null);
    };

    const authInfo: AuthContextType = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
};
