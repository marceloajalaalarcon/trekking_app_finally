import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SystemRole } from '@prisma/client';

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.trekking.findMany({
            include: {
                _count: {
                    select: { members: true, checkpoints: true, teams: true }
                }
            }
        });
    }

    async findOne(id: string) {
        const event = await this.prisma.trekking.findUnique({
            where: { id },
            include: {
                roles: true,
                checkpoints: { orderBy: { order: 'asc' } },
                _count: { select: { members: true, teams: true } }
            }
        });
        if (!event) throw new NotFoundException('Trekking not found');

        const acceptedTeamsCount = await this.prisma.trekkingTeam.count({
            where: {
                trekking_id: id,
                status: { in: ['REGISTERED', 'ACTIVE', 'COMPLETED'] }
            }
        });

        if (event.roles) {
            event.roles = event.roles.map((r: any) => ({ ...r, permissions: Number(r.permissions) }));
        }

        return { ...event, accepted_teams_count: acceptedTeamsCount };
    }

    async create(data: { name: string; description?: string; location?: string; teams_start_interval: number; checkpoints_count: number; start_date?: string; end_date?: string; is_registration_open?: boolean; is_tracking?: boolean; has_extra_activities?: boolean; max_teams?: number; min_team_size?: number; max_team_size?: number }) {
        return this.prisma.trekking.create({
            data: {
                name: data.name,
                description: data.description,
                location: data.location,
                teams_start_interval: data.teams_start_interval,
                checkpoints_count: data.checkpoints_count,
                is_registration_open: data.is_registration_open ?? false,
                is_tracking: data.is_tracking ?? false,
                has_extra_activities: data.has_extra_activities ?? false,
                max_teams: data.max_teams,
                min_team_size: data.min_team_size,
                max_team_size: data.max_team_size,
                start_date: data.start_date ? new Date(data.start_date) : null,
                end_date: data.end_date ? new Date(data.end_date) : null,
                checkpoints: {
                    create: Array.from({ length: data.checkpoints_count }).map((_, i) => ({
                        name: `CP${i + 1}`,
                        order: i + 1,
                    }))
                }
            }
        });
    }

    async update(id: string, data: { name?: string; description?: string; location?: string; teams_start_interval?: number; checkpoints_count?: number; start_date?: string; end_date?: string; checkpoints?: any[]; max_teams?: number; min_team_size?: number; max_team_size?: number; is_registration_open?: boolean; is_tracking?: boolean; has_extra_activities?: boolean }) {
        const updateData: any = { ...data };
        delete updateData.checkpoints;

        if (data.start_date) updateData.start_date = new Date(data.start_date);
        if (data.end_date) updateData.end_date = new Date(data.end_date);

        const result = await this.prisma.trekking.update({
            where: { id },
            data: updateData
        });

        if (data.checkpoints && Array.isArray(data.checkpoints)) {
            await this.prisma.checkpoint.deleteMany({ where: { trekking_id: id } });
            await this.prisma.checkpoint.createMany({
                data: data.checkpoints.map((cp, idx) => ({
                    trekking_id: id,
                    order: idx,
                    name: cp.name,
                    ideal_time_offset: cp.ideal_time_offset || 0,
                    is_start_line: idx === 0,
                    is_finish_line: idx === data.checkpoints!.length - 1
                }))
            });
        }

        return result;
    }

    async getRoles(id: string) {
        const roles = await this.prisma.trekkingRole.findMany({ where: { trekking_id: id } });
        return roles.map(role => ({ ...role, permissions: Number(role.permissions) }));
    }

    async createRole(id: string, data: { name: string; permissions: number }) {
        const role = await this.prisma.trekkingRole.create({
            data: {
                trekking_id: id,
                name: data.name,
                permissions: BigInt(data.permissions)
            }
        });
        return { ...role, permissions: Number(role.permissions) };
    }

    async updateRole(id: string, roleId: string, data: { name: string; permissions: number }) {
        const role = await this.prisma.trekkingRole.update({
            where: { id: roleId },
            data: {
                name: data.name,
                permissions: BigInt(data.permissions)
            }
        });
        return { ...role, permissions: Number(role.permissions) };
    }

    async deleteRole(id: string, roleId: string) {
        const role = await this.prisma.trekkingRole.delete({
            where: { id: roleId }
        });
        return { ...role, permissions: Number(role.permissions) };
    }

    async getMembers(id: string) {
        const members = await this.prisma.trekkingMember.findMany({
            where: { trekking_id: id }
        });

        // Manual joins since the relation might not be fully configured in Prisma types
        const result = [];
        for (const m of members) {
            const user = await this.prisma.user.findUnique({ where: { id: m.user_id }, select: { id: true, name: true, email: true } });
            const role = await this.prisma.trekkingRole.findUnique({ where: { id: m.role_id }, select: { id: true, name: true, permissions: true } });
            if (user && role) {
                result.push({
                    user_id: m.user_id,
                    name: user.name,
                    email: user.email,
                    role_id: m.role_id,
                    role_name: role.name,
                    permissions: Number(role.permissions)
                });
            }
        }
        return result;
    }

    async addMember(trekkingId: string, email: string, roleId: string, password?: string) {
        let user = await this.prisma.user.findUnique({ where: { email } });

        // Use a simple hash mechanism or store directly if bcrypt is not configured
        // In a real production scenario, use bcrypt.hashSync(password, 10). 
        // For now, depending on your auth service, we'll store it as is or use bcrypt if imported.
        const bcrypt = require('bcryptjs');
        const hash = password ? bcrypt.hashSync(password, 10) : undefined;

        if (!user) {
            if (!hash) {
                throw new BadRequestException('Uma senha é obrigatória para convidar um novo membro que não possui conta.');
            }
            // Create user for the staff if they don't exist yet
            user = await this.prisma.user.create({
                data: {
                    email,
                    name: email.split('@')[0],
                    password_hash: hash
                }
            });
        } else if (hash) {
            // If user exists and a new password/pin was provided, update it
            await this.prisma.user.update({
                where: { email },
                data: { password_hash: hash }
            });
        }

        const role = await this.prisma.trekkingRole.findUnique({ where: { id: roleId, trekking_id: trekkingId } });
        if (!role) throw new NotFoundException('Função não encontrada');

        const member = await this.prisma.trekkingMember.upsert({
            where: {
                user_id_trekking_id: { user_id: user.id, trekking_id: trekkingId }
            },
            create: {
                trekking_id: trekkingId,
                user_id: user.id,
                role_id: roleId
            },
            update: {
                role_id: roleId
            }
        });

        return {
            user_id: member.user_id,
            name: user.name,
            email: user.email,
            role_id: member.role_id,
            role_name: role.name,
            permissions: Number(role.permissions)
        };
    }

    async removeMember(trekkingId: string, userId: string) {
        await this.prisma.trekkingMember.delete({
            where: {
                user_id_trekking_id: { user_id: userId, trekking_id: trekkingId }
            }
        });
        return { success: true };
    }

    async registerTeam(trekkingId: string, teamId: string) {
        const trekking = await this.prisma.trekking.findUnique({ where: { id: trekkingId } });
        if (!trekking) throw new NotFoundException('Trekking não encontrado');
        if (!trekking.is_registration_open) throw new ConflictException('Inscrições fechadas');

        const existing = await this.prisma.trekkingTeam.findUnique({
            where: { trekking_id_team_id: { trekking_id: trekkingId, team_id: teamId } },
        });
        if (existing) throw new ConflictException('Time já inscrito');

        if (trekking.max_teams) {
            const count = await this.prisma.trekkingTeam.count({ where: { trekking_id: trekkingId } });
            if (count >= trekking.max_teams) throw new ConflictException('Limite de times atingido');
        }

        return this.prisma.trekkingTeam.create({
            data: { trekking_id: trekkingId, team_id: teamId },
            include: { team: true },
        });
    }

    async unregisterTeam(trekkingId: string, teamId: string) {
        await this.prisma.trekkingTeam.delete({
            where: { trekking_id_team_id: { trekking_id: trekkingId, team_id: teamId } },
        });
        return { success: true };
    }

    async getRanking(trekkingId: string) {
        const records = await this.prisma.trackingRecord.findMany({
            where: { trekking_id: trekkingId },
            orderBy: { read_at: 'asc' },
        });

        const teamScores = new Map<string, number>();
        for (const r of records) {
            teamScores.set(r.team_id, (teamScores.get(r.team_id) || 0) + 1);
        }

        const teams = await this.prisma.trekkingTeam.findMany({
            where: { trekking_id: trekkingId },
            include: { team: { include: { members: { include: { user: { select: { id: true, name: true } } } } } } },
        });

        const ranking = teams
            .map(tt => ({
                team_id: tt.team_id,
                team_name: tt.team.name,
                points: teamScores.get(tt.team_id) || 0,
                members: tt.team.members.map(m => ({ id: m.user.id, name: m.user.name })),
                status: tt.status,
            }))
            .sort((a, b) => b.points - a.points)
            .map((entry, idx) => ({ ...entry, position: idx + 1 }));

        return ranking;
    }
}
