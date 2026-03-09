import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
const prisma = new PrismaClient();

async function main() {
    const teams = await prisma.trekkingTeam.count();
    const standard = await prisma.eventParticipant.count();
    fs.writeFileSync('db-output.json', JSON.stringify({ teams, standard }, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
