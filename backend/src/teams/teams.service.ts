import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TeamsService {
    constructor(private prisma: PrismaService) { }

    async getMyTeams(userId: string) {
        return this.prisma.team.findMany({
            where: { members: { some: { user_id: userId } } },
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
                _count: { select: { members: true, events: true } },
            },
            orderBy: { created_at: 'desc' },
        });
    }

    async create(name: string, userId: string) {
        const team = await this.prisma.team.create({
            data: {
                name,
                created_by: userId,
                members: {
                    create: { user_id: userId, role: 'OWNER' },
                },
            },
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
            },
        });
        return team;
    }

    async findOne(id: string) {
        const team = await this.prisma.team.findUnique({
            where: { id },
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
                _count: { select: { members: true, events: true } },
            },
        });
        if (!team) throw new NotFoundException('Time não encontrado');
        return team;
    }

    async invite(teamId: string, email: string, inviterId: string) {
        const team = await this.prisma.team.findUnique({ where: { id: teamId } });
        if (!team) throw new NotFoundException('Time não encontrado');

        const inviter = await this.prisma.teamMember.findUnique({
            where: { team_id_user_id: { team_id: teamId, user_id: inviterId } },
        });
        if (!inviter || !['OWNER', 'ADMIN'].includes(inviter.role)) {
            throw new ForbiddenException('Sem permissão para convidar');
        }

        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new NotFoundException('Usuário não encontrado');

        const existing = await this.prisma.teamMember.findUnique({
            where: { team_id_user_id: { team_id: teamId, user_id: user.id } },
        });
        if (existing) throw new ConflictException('Usuário já é membro');

        return this.prisma.teamMember.create({
            data: { team_id: teamId, user_id: user.id, role: 'MEMBER' },
            include: { user: { select: { id: true, name: true, email: true } } },
        });
    }

    async leave(teamId: string, userId: string) {
        const member = await this.prisma.teamMember.findUnique({
            where: { team_id_user_id: { team_id: teamId, user_id: userId } },
        });
        if (!member) throw new NotFoundException('Não é membro deste time');

        await this.prisma.teamMember.delete({
            where: { team_id_user_id: { team_id: teamId, user_id: userId } },
        });
        return { success: true };
    }

    async removeMember(teamId: string, targetUserId: string, requesterId: string) {
        const requester = await this.prisma.teamMember.findUnique({
            where: { team_id_user_id: { team_id: teamId, user_id: requesterId } },
        });
        if (!requester || !['OWNER', 'ADMIN'].includes(requester.role)) {
            throw new ForbiddenException('Sem permissão');
        }

        await this.prisma.teamMember.delete({
            where: { team_id_user_id: { team_id: teamId, user_id: targetUserId } },
        });
        return { success: true };
    }
}
