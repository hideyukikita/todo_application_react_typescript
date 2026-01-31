import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react'
import api from '../lib/axios';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // アプリ起動時にLocalStrageを確認
    useEffect(() => {
        const storeUser = localStorage.getItem('todo_app_user');
        const token = localStorage.getItem('todo_app_token');
        if(storeUser && token) {
            setUser(JSON.parse(storeUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('todo_app_token', data.token);
        localStorage.setItem('todo_app_user', JSON.stringify(data.user));
        setUser(data.user);
    };

    const signup = async(name: string, email: string, password: string) => {
        await api.post('/auth/signup', { name, email, password });
    };

    const logout = () => {
        localStorage.removeItem('todo_app_token');
        localStorage.removeItem('todo_app_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};