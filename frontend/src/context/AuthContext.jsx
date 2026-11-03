import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('freshora_user')) || null;
        } catch {
            return null;
        }
    });
    const [seller, setSeller] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('freshora_seller')) || null;
        } catch {
            return null;
        }
    });
    const [token, setToken] = useState(() => localStorage.getItem('freshora_token') || null);
    const [loading, setLoading] = useState(false);

    // Persist session
    useEffect(() => {
        if (token) localStorage.setItem('freshora_token', token);
        else localStorage.removeItem('freshora_token');
        if (user) localStorage.setItem('freshora_user', JSON.stringify(user));
        else localStorage.removeItem('freshora_user');
        if (seller) localStorage.setItem('freshora_seller', JSON.stringify(seller));
        else localStorage.removeItem('freshora_seller');
    }, [token, user, seller]);

    const login = useCallback(async (email, password, role) => {
        setLoading(true);
        try {
            const res = await authService.login({ email, password, role });
            setToken(res.data.token);
            setUser(res.data.user);
            setSeller(res.data.seller || null);
            return res.data;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (data) => {
        setLoading(true);
        try {
            const res = await authService.register(data);
            // Auto-login after registration
            setToken(res.data.token);
            setUser(res.data.user);
            setSeller(res.data.seller || null);
            return res.data;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        setSeller(null);
    }, []);

    const updateUser = useCallback((newUser) => {
        setUser(newUser);
    }, []);

    const updateSeller = useCallback((newSeller) => {
        setSeller(newSeller);
    }, []);

    const value = {
        user,
        seller,
        token,
        loading,
        isAuthenticated: !!user,
        isBuyer: user?.role === 'buyer',
        isSeller: user?.role === 'seller',
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUser,
        updateSeller,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}