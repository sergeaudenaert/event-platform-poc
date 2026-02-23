"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/events')
      .then(setEvents)
      .catch(err => console.error('Failed to fetch events', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center space-y-4 py-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Discover Amazing Events
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Join thought-provoking conferences, interactive workshops, and exclusive networking sessions happening near you or online.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-muted-foreground col-span-full text-center py-10">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-10">No upcoming events found.</p>
        ) : (
          events.map((event: any) => (
            <Card key={event.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="line-clamp-3 text-sm text-neutral-600 mb-4">{event.description}</p>
                <div className="flex flex-col space-y-2 text-sm text-neutral-500 font-medium">
                  <span className="flex items-center">
                    📍 {event.location}
                  </span>
                  <span className="flex items-center">
                    🎟️ {event.capacity} seats total
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/events/${event.id}`} className="w-full">
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
