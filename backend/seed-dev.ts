import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@tracking.com';
    const password = 'developer123';
    const name = 'Developer Master';

    // Check if developer already exists
    const existingDev = await prisma.user.findUnique({
        where: { email }
    });

    if (existingDev) {
        console.log('Developer account already exists:', email);
        return;
    }

    const saltOrRounds = 10;
    const password_hash = await bcrypt.hash(password, saltOrRounds);

    const dev = await prisma.user.create({
        data: {
            email,
            password_hash,
            name,
            role: 'DEVELOPER'
        }
    });

    console.log('Developer account created successfully!');
    console.log('Email:', dev.email);
    console.log('Password:', password);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
