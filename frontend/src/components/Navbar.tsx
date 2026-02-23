"use client";

import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <nav className="border-b bg-background sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <NextLink href="/" className="font-bold text-xl tracking-tight">
                    EventHub
                </NextLink>

                <div className="flex items-center space-x-4">
                    <NextLink href="/">
                        <Button variant="ghost">Events</Button>
                    </NextLink>

                    {user ? (
                        <>
                            {user.role === 'ADMIN' && (
                                <NextLink href="/dashboard">
                                    <Button variant="ghost">Dashboard</Button>
                                </NextLink>
                            )}
                            <Button variant="outline" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <NextLink href="/login">
                                <Button variant="ghost">Login</Button>
                            </NextLink>
                            <NextLink href="/register">
                                <Button>Sign Up</Button>
                            </NextLink>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
