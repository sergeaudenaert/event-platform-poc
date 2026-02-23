import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding data...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            password: adminPassword,
            role: 'ADMIN',
        },
    });
    console.log(`Created admin user: ${admin.email}`);

    // Create demo events
    const demoEvents = [
        {
            title: 'Global Tech Conference 2026',
            description: 'A gathering of tech enthusiasts globally discussing future innovations.',
            date: new Date('2026-06-15T09:00:00Z'),
            capacity: 500,
            location: 'San Francisco, CA Convention Center',
        },
        {
            title: 'Startups & Investors Meetup',
            description: 'A networking event to connect ambitious founders with angel investors.',
            date: new Date('2026-07-20T18:00:00Z'),
            capacity: 100,
            location: 'New York, NY - The Grand Hotel',
        },
        {
            title: 'Web Development Workshop',
            description: 'A hands-on workshop focused on modern React and containerization.',
            date: new Date('2026-08-05T10:00:00Z'),
            capacity: 50,
            location: 'Online via Zoom',
        },
        {
            title: 'AI in Enterprise Summit',
            description: 'Discover how AI is reshaping traditional enterprise workflows.',
            date: new Date('2026-09-10T09:30:00Z'),
            capacity: 250,
            location: 'London, UK - ExCeL Centre',
        },
    ];

    for (const eventData of demoEvents) {
        const event = await prisma.event.create({
            data: eventData
        });
        console.log(`Created event: ${event.title}`);
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
