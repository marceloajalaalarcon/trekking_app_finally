'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (access: string, refresh: string, user: User) => void;
    logout: () => void;
    getAccessToken: () => string | null;
    authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const refreshingRef = useRef<Promise<string | null> | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const storedUser = localStorage.getItem('@Tracking:user');
        const storedAccess = localStorage.getItem('@Tracking:token');

        if (storedUser && storedAccess) {
            setUser(JSON.parse(storedUser));
            setAccessToken(storedAccess);
        }

        setLoading(false);
    }, []);

    const getHomeForRole = (role: string) => {
        if (role === 'DEVELOPER') return '/developer';
        if (role === 'TREKKING_CREATOR') return '/trekkings';
        return '/events';
    };

    useEffect(() => {
        if (!loading) {
            const publicPaths = ['/login'];
            const developerOnlyPaths = ['/developer'];
            const standardOnlyPaths = ['/events'];
            const trekkingPaths = ['/trekkings'];

            if (!user && !publicPaths.includes(pathname)) {
                router.push('/login');
            } else if (user) {
                if (pathname === '/login') {
                    router.push(getHomeForRole(user.role));
                }
                if (user.role === 'DEVELOPER' && (standardOnlyPaths.some(p => pathname.startsWith(p)) || trekkingPaths.some(p => pathname.startsWith(p)))) {
                    router.push('/developer');
                }
                if (user.role === 'STANDARD_CREATOR' && (developerOnlyPaths.some(p => pathname.startsWith(p)) || trekkingPaths.some(p => pathname.startsWith(p)))) {
                    router.push('/events');
                }
                if (user.role === 'TREKKING_CREATOR' && (developerOnlyPaths.some(p => pathname.startsWith(p)) || standardOnlyPaths.some(p => pathname.startsWith(p)))) {
                    router.push('/trekkings');
                }
            }
        }
    }, [user, loading, pathname, router]);

    const refreshAccessToken = useCallback(async (): Promise<string | null> => {
        // Prevent concurrent refresh requests
        if (refreshingRef.current) return refreshingRef.current;

        const refreshToken = localStorage.getItem('@Tracking:refreshToken');
        if (!refreshToken) {
            logout();
            return null;
        }

        refreshingRef.current = (async () => {
            try {
                const res = await fetch('http://localhost:3333/auth/refresh', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });

                if (!res.ok) {
                    logout();
                    return null;
                }

                const data = await res.json();
                const newToken = data.access_token;
                setAccessToken(newToken);
                localStorage.setItem('@Tracking:token', newToken);

                if (data.refresh_token) {
                    localStorage.setItem('@Tracking:refreshToken', data.refresh_token);
                }

                return newToken;
            } catch {
                logout();
                return null;
            } finally {
                refreshingRef.current = null;
            }
        })();

        return refreshingRef.current;
    }, []);

    // Auto-fetch with retry on 401
    const authFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
        const token = accessToken || localStorage.getItem('@Tracking:token');
        const headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        };

        let res = await fetch(url, { ...options, headers });

        // If 401, try refreshing the token and retry once
        if (res.status === 401) {
            const newToken = await refreshAccessToken();
            if (newToken) {
                const retryHeaders = {
                    ...options.headers,
                    Authorization: `Bearer ${newToken}`,
                };
                res = await fetch(url, { ...options, headers: retryHeaders });
            }
        }

        return res;
    }, [accessToken, refreshAccessToken]);

    const login = (access: string, refresh: string, loggedUser: User) => {
        setUser(loggedUser);
        setAccessToken(access);

        localStorage.setItem('@Tracking:user', JSON.stringify(loggedUser));
        localStorage.setItem('@Tracking:token', access);
        localStorage.setItem('@Tracking:refreshToken', refresh);

        const home = loggedUser.role === 'DEVELOPER' ? '/developer'
            : loggedUser.role === 'TREKKING_CREATOR' ? '/trekkings'
                : '/events';
        router.push(home);
    };

    const logout = () => {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('@Tracking:user');
        localStorage.removeItem('@Tracking:token');
        localStorage.removeItem('@Tracking:refreshToken');
        router.push('/login');
    };

    const getAccessToken = () => accessToken;

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, getAccessToken, authFetch }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
