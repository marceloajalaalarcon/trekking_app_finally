const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const teams = await prisma.trekkingTeam.findMany({ include: { team: true } });
    console.log("Registered Teams:", JSON.stringify(teams, null, 2));

    const standard = await prisma.eventParticipant.findMany();
    console.log("Registered Standard:", JSON.stringify(standard, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
