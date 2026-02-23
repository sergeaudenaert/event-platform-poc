import { Router, Response } from 'express';
import prisma from '../db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import exceljs from 'exceljs';

const router = Router();

router.use(authenticate, requireAdmin);

// View all registrations (optionally filtered by event)
router.get('/registrations', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const eventId = req.query.eventId as string;

        const whereClause = eventId ? { eventId } : {};

        const registrations = await prisma.registration.findMany({
            where: whereClause,
            include: {
                user: { select: { id: true, email: true } },
                event: { select: { id: true, title: true, date: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(registrations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export registrations to Excel
router.get('/export', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const registrations = await prisma.registration.findMany({
            include: {
                user: { select: { email: true } },
                event: { select: { title: true, date: true, location: true } }
            },
            orderBy: [
                { event: { date: 'asc' } },
                { createdAt: 'desc' }
            ]
        });

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Registrations');

        worksheet.columns = [
            { header: 'Event Title', key: 'eventTitle', width: 30 },
            { header: 'Event Date', key: 'eventDate', width: 20 },
            { header: 'Event Location', key: 'eventLocation', width: 30 },
            { header: 'User Email', key: 'userEmail', width: 30 },
            { header: 'Registration Status', key: 'status', width: 20 },
            { header: 'Registration Date', key: 'registrationDate', width: 20 },
        ];

        registrations.forEach(r => {
            worksheet.addRow({
                eventTitle: r.event.title,
                eventDate: r.event.date.toISOString().split('T')[0],
                eventLocation: r.event.location,
                userEmail: r.user.email,
                status: r.status,
                registrationDate: r.createdAt.toISOString().split('T')[0],
            });
        });

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + 'registrations-export.xlsx'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update event
router.put('/events/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { title, description, date, capacity, location } = req.body;

        const event = await prisma.event.update({
            where: { id },
            data: {
                title,
                description,
                date: new Date(date),
                capacity: parseInt(capacity),
                location
            }
        });

        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete event
router.delete('/events/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        await prisma.registration.deleteMany({
            where: { eventId: id }
        });

        await prisma.event.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
