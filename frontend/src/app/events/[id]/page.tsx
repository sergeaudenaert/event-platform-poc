"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { useRouter, useParams } from 'next/navigation';

export default function EventDetail() {
    const params = useParams();
    const id = params?.id as string;
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [operationLoading, setOperationLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!id) return;
        fetchApi(`/events/${id}`)
            .then((data) => {
                setEvent(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    const handleRegister = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        setOperationLoading(true);
        try {
            await fetchApi(`/events/${id}/register`, { method: 'POST' });
            alert('Successfully registered!');
            // Refresh event capacity
            const data = await fetchApi(`/events/${id}`);
            setEvent(data);
        } catch (err: any) {
            alert(err.message || 'Registration failed');
        } finally {
            setOperationLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20">Loading event...</div>;
    if (error || !event) return <div className="text-center py-20 text-red-500">{error || 'Event not found'}</div>;

    const registrationsCount = event._count?.registrations || 0;
    const isFull = registrationsCount >= event.capacity;

    return (
        <div className="max-w-3xl mx-auto py-12">
            <Card className="shadow-lg border-0 overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 flex items-end">
                    <h1 className="text-4xl font-bold text-white tracking-tight">{event.title}</h1>
                </div>
                <CardContent className="pt-8 space-y-6">
                    <div className="flex items-center space-x-2 text-neutral-500 bg-neutral-100 p-3 rounded-lg w-fit">
                        <span className="font-semibold text-neutral-800">
                            📅 {new Date(event.date).toLocaleDateString('en-US', {
                                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                            })}
                        </span>
                        <span className="px-2 border-l border-neutral-300">📍 {event.location}</span>
                    </div>

                    <p className="text-lg leading-relaxed text-neutral-700 border-l-4 border-indigo-500 pl-4 py-1">
                        {event.description}
                    </p>

                    <div className="pt-6 border-t flex justify-between items-center text-sm font-medium">
                        <div className="flex flex-col bg-neutral-50 p-4 rounded-xl shadow-inner border border-neutral-100">
                            <span className="text-neutral-500">Tickets Available</span>
                            <span className={`text-xl ${isFull ? 'text-red-500' : 'text-emerald-600'}`}>
                                {Math.max(0, event.capacity - registrationsCount)} / {event.capacity}
                            </span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-neutral-50 p-6">
                    <Button
                        size="lg"
                        className="w-full text-lg shadow-md hover:shadow-lg transition-all"
                        disabled={isFull || operationLoading}
                        onClick={handleRegister}
                    >
                        {isFull ? 'Event Sold Out' : (operationLoading ? 'Processing...' : 'Secure Your Spot Now')}
                    </Button>
                </CardFooter>
            </Card>

            {!user && !isFull && (
                <p className="text-center text-sm text-neutral-500 mt-4">
                    You must be logged in to register. <button onClick={() => router.push('/login')} className="text-blue-500 font-medium hover:underline">Log in here</button>.
                </p>
            )}
        </div>
    );
}
