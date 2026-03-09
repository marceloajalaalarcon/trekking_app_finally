import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { SystemRole } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(data: { name: string; email: string; password_hash: string; role: SystemRole }) {
        const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            throw new ConflictException('Email já está em uso.');
        }

        const saltOrRounds = 10;
        const hash = await bcrypt.hash(data.password_hash, saltOrRounds);

        const user = await this.prisma.user.create({
            data: {
                ...data,
                password_hash: hash,
            },
        });

        const { password_hash, ...result } = user;
        return result;
    }

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                created_at: true,
            }
        });
    }

    async findOne(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async remove(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException('Usuário não encontrado.');
        }
        await this.prisma.user.delete({ where: { id } });
        return { success: true };
    }

    async getStats(userId: string) {
        const userTeamIds = (await this.prisma.teamMember.findMany({
            where: { user_id: userId },
            select: { team_id: true },
        })).map(t => t.team_id);

        const [trekkingTeams, eventParticipations, certificates, trackingRecords] = await Promise.all([
            this.prisma.trekkingTeam.count({
                where: { team_id: { in: userTeamIds } },
            }),
            this.prisma.eventParticipant.count({ where: { user_id: userId } }),
            this.prisma.certificate.count({ where: { user_id: userId } }),
            this.prisma.trackingRecord.count({
                where: { team_id: { in: userTeamIds } },
            }),
        ]);

        return {
            events_count: trekkingTeams + eventParticipations,
            certificates_count: certificates,
            points: trackingRecords,
        };
    }

    async getMyEvents(userId: string) {
        const [trekkingTeams, eventParticipations] = await Promise.all([
            this.prisma.trekkingTeam.findMany({
                where: { team: { members: { some: { user_id: userId } } } },
                include: {
                    trekking: true,
                    team: { include: { members: { include: { user: { select: { id: true, name: true } } } } } },
                },
            }),
            this.prisma.eventParticipant.findMany({
                where: { user_id: userId },
                include: {
                    event: { include: { owner: { select: { id: true, name: true } } } },
                },
            }),
        ]);

        const trekkingEvents = trekkingTeams.map(tt => ({
            id: tt.trekking.id,
            type: 'trekking' as const,
            name: tt.trekking.name,
            description: tt.trekking.description,
            location: tt.trekking.location,
            start_date: tt.trekking.start_date,
            end_date: tt.trekking.end_date,
            status: tt.status,
            team_name: tt.team.name,
            team_id: tt.team_id,
        }));

        const standardEvents = eventParticipations.map(ep => ({
            id: ep.event.id,
            type: 'standard' as const,
            name: ep.event.name,
            description: ep.event.description,
            location: ep.event.location,
            start_date: ep.event.date,
            end_date: ep.event.end_date,
            status: ep.status,
            team_name: null,
            team_id: null,
        }));

        return [...trekkingEvents, ...standardEvents].sort((a, b) => {
            const da = a.start_date ? new Date(a.start_date).getTime() : 0;
            const db = b.start_date ? new Date(b.start_date).getTime() : 0;
            return db - da;
        });
    }

    async updateProfile(userId: string, data: { name?: string; email?: string }) {
        if (data.email) {
            const existing = await this.prisma.user.findFirst({
                where: { email: data.email, NOT: { id: userId } },
            });
            if (existing) throw new ConflictException('Email já está em uso.');
        }

        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.email && { email: data.email }),
            },
        });

        const { password_hash, ...result } = user;
        return result;
    }

    async getMyStaffRoles(userId: string) {
        const memberships = await this.prisma.trekkingMember.findMany({
            where: { user_id: userId },
            include: {
                trekking: true,
                role: true,
            },
        });

        return memberships.map(m => ({
            trekking_id: m.trekking_id,
            trekking_name: m.trekking.name,
            trekking_location: m.trekking.location,
            start_date: m.trekking.start_date,
            end_date: m.trekking.end_date,
            is_tracking: m.trekking.is_tracking,
            role_id: m.role_id,
            role_name: m.role.name,
            permissions: Number(m.role.permissions),
        }));
    }
}
