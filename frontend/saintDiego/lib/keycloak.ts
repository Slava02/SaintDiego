import Keycloak from 'keycloak-js';

export interface KeycloakConfig {
    url: string;
    realm: string;
    clientId: string;
}

export const keycloakConfig: KeycloakConfig = {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:3010',
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'SaintDiego',
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'ui-client',
};

export const keycloak = new Keycloak({
    url: keycloakConfig.url,
    realm: keycloakConfig.realm,
    clientId: keycloakConfig.clientId
});

let initializationPromise: Promise<boolean> | null = null;

export const initKeycloak = () => {
    if (initializationPromise) {
        return initializationPromise;
    }

    initializationPromise = keycloak
        .init({
            onLoad: 'login-required',
            pkceMethod: 'S256'
        })
        .then(authenticated => {
            if (!authenticated) {
                throw new Error('Not authenticated!');
            }

            if (!keycloak.hasResourceRole('booking-client', keycloakConfig.clientId)) {
                throw new Error('RBAC: No required role for this user');
            }

            return true;
        })
        .catch((error) => {
            initializationPromise = null;
            console.error('Keycloak error:', error);
            throw error;
        });

    return initializationPromise;
}; 