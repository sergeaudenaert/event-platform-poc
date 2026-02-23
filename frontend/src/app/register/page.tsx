"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { Card, CardContent, CardTitle, CardHeader, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const data = await fetchApi('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            login(data.token, data.user);
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-center py-20">
            <Card className="w-full max-w-sm">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Sign Up</CardTitle>
                        <CardDescription>Create a new account to register for events.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full">Register</Button>
                        <p className="text-sm text-center text-neutral-500">
                            Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Log in</Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
