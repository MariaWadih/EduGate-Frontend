import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Just try to get user. If 401, we just aren't logged in.
        authService.getMe()
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        await authService.csrf(); // Get cookie first
        const res = await authService.login(email, password);
        setUser(res.data.user);
        return res.data.user;
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            window.location.href = '/login';
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

