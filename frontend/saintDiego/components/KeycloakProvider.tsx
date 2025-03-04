'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { keycloak, initKeycloak } from '@/lib/keycloak';

interface KeycloakContextType {
    authenticated: boolean;
    user: any;
    token: string | undefined;
    login: () => void;
    logout: () => void;
}

const KeycloakContext = createContext<KeycloakContextType>({
    authenticated: false,
    user: null,
    token: undefined,
    login: () => { },
    logout: () => { }
});

export function KeycloakProvider({ children }: { children: React.ReactNode }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string>();

    useEffect(() => {
        const init = async () => {
            try {
                await initKeycloak();
                setAuthenticated(true);
                setToken(keycloak.token);
                const userInfo = await keycloak.loadUserInfo();
                setUser(userInfo);
            } catch (error) {
                console.error('Authentication error:', error);
                setAuthenticated(false);
                setUser(null);
                setToken(undefined);
            }
        };

        init();
    }, []);

    const login = useCallback(() => {
        keycloak.login();
    }, []);

    const logout = useCallback(() => {
        keycloak.logout();
    }, []);

    return (
        <KeycloakContext.Provider value={{ authenticated, user, token, login, logout }}>
            {children}
        </KeycloakContext.Provider>
    );
}

export const useKeycloak = () => useContext(KeycloakContext); 