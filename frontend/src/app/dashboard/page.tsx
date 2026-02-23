"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Dashboard() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [activeTab, setActiveTab] = useState('events');

    // New Event Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [capacity, setCapacity] = useState('');
    const [location, setLocation] = useState('');

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            router.push('/');
        }
    }, [user, router]);

    const loadData = async () => {
        try {
            const [evts, regs] = await Promise.all([
                fetchApi('/events'),
                fetchApi('/admin/registrations')
            ]);
            setEvents(evts);
            setRegistrations(regs);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            loadData();
        }
    }, [user]);

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetchApi('/events', {
                method: 'POST',
                body: JSON.stringify({ title, description, date, capacity, location })
            });
            alert('Event created successfully');
            loadData();
            // Reset form
            setTitle(''); setDescription(''); setDate(''); setCapacity(''); setLocation('');
        } catch (err: any) {
            alert(err.message || 'Failed to create event');
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            await fetchApi(`/admin/events/${id}`, { method: 'DELETE' });
            loadData();
        } catch (err: any) {
            alert(err.message || 'Failed to delete event');
        }
    };

    const handleExport = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/admin/export', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'registrations-export.xlsx';
            a.click();
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (!user || user.role !== 'ADMIN') return <p className="text-center py-20 text-neutral-500">Access Denied</p>;

    return (
        <div className="py-10 max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <Button onClick={handleExport} variant="default" className="bg-indigo-600 hover:bg-indigo-700">
                    📥 Export Data (.xlsx)
                </Button>
            </div>

            <div className="flex space-x-4 border-b pb-2">
                <button
                    className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'events' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-neutral-500 hover:text-neutral-800'}`}
                    onClick={() => setActiveTab('events')}
                >
                    Manage Events
                </button>
                <button
                    className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'registrations' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-neutral-500 hover:text-neutral-800'}`}
                    onClick={() => setActiveTab('registrations')}
                >
                    View Registrations
                </button>
            </div>

            {activeTab === 'events' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border space-y-4 h-fit">
                        <h2 className="text-xl font-semibold">Create New Event</h2>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <div>
                                <Label>Title</Label>
                                <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input required value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                            <div>
                                <Label>Date & Time</Label>
                                <Input type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)} />
                            </div>
                            <div>
                                <Label>Capacity</Label>
                                <Input type="number" required value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                            </div>
                            <div>
                                <Label>Location</Label>
                                <Input required value={location} onChange={(e) => setLocation(e.target.value)} />
                            </div>
                            <Button type="submit" className="w-full">Create Event</Button>
                        </form>
                    </div>

                    <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border overflow-x-auto">
                        <h2 className="text-xl font-semibold mb-4">Existing Events</h2>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.map((evt: any) => (
                                    <TableRow key={evt.id}>
                                        <TableCell className="font-medium">{evt.title}</TableCell>
                                        <TableCell>{new Date(evt.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{evt.capacity}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(evt.id)}>Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {activeTab === 'registrations' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border overflow-x-auto">
                    <h2 className="text-xl font-semibold mb-4">All Registrations</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User Email</TableHead>
                                <TableHead>Event</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date Registered</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {registrations.map((reg: any) => (
                                <TableRow key={reg.id}>
                                    <TableCell className="font-medium">{reg.user.email}</TableCell>
                                    <TableCell>{reg.event.title}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 text-xs rounded-full ${reg.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                            {reg.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{new Date(reg.createdAt).toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
