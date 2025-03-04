'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKeycloak } from '@/components/KeycloakProvider';

export default function LoginPage() {
    const router = useRouter();
    const { authenticated, token } = useKeycloak();

    useEffect(() => {
        if (authenticated && token) {
            router.replace('/');
        }
    }, [authenticated, token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Вход в систему
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Выполняется авторизация...
                    </p>
                </div>
            </div>
        </div>
    );
} 