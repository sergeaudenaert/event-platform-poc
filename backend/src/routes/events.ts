import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all events
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const events = await prisma.event.findMany({
            orderBy: { date: 'asc' }
        });
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single event
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { registrations: { where: { status: 'CONFIRMED' } } }
                }
            }
        });

        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create event (Admin only)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, description, date, capacity, location } = req.body;

        const event = await prisma.event.create({
            data: {
                title,
                description,
                date: new Date(date),
                capacity: parseInt(capacity),
                location
            }
        });

        res.status(201).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Register for an event (Authenticated user)
router.post('/:id/register', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const eventId = req.params.id as string;
        const userId = req.user!.id;

        // Check if event exists and has capacity
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                _count: {
                    select: { registrations: { where: { status: 'CONFIRMED' } } }
                }
            }
        });

        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        if ((event as any)._count.registrations >= event.capacity) {
            res.status(400).json({ error: 'Event is at full capacity' });
            return;
        }

        // Check if already registered
        const existingRegistration = await prisma.registration.findUnique({
            where: {
                userId_eventId: {
                    userId,
                    eventId
                }
            }
        });

        if (existingRegistration) {
            if (existingRegistration.status === 'CONFIRMED') {
                res.status(400).json({ error: 'Already registered for this event' });
                return;
            } else {
                // Re-activate cancelled registration
                const updated = await prisma.registration.update({
                    where: { id: existingRegistration.id },
                    data: { status: 'CONFIRMED' }
                });
                res.json(updated);
                return;
            }
        }

        // Create new registration
        const registration = await prisma.registration.create({
            data: {
                userId,
                eventId,
                status: 'CONFIRMED'
            }
        });

        res.status(201).json(registration);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Cancel registration (Authenticated user)
router.delete('/:id/register', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const eventId = req.params.id as string;
        const userId = req.user!.id;

        const registration = await prisma.registration.findUnique({
            where: {
                userId_eventId: {
                    userId,
                    eventId
                }
            }
        });

        if (!registration) {
            res.status(404).json({ error: 'Registration not found' });
            return;
        }

        const cancelled = await prisma.registration.update({
            where: { id: registration.id },
            data: { status: 'CANCELLED' }
        });

        res.json(cancelled);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
