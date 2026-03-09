import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EventsStandardService {
    constructor(private prisma: PrismaService) { }

    async create(data: any, userId: string) {
        return this.prisma.event.create({
            data: {
                name: data.name,
                description: data.description || null,
                location: data.location || null,
                date: data.date ? new Date(data.date) : null,
                end_date: data.end_date ? new Date(data.end_date) : null,
                max_participants: data.max_participants ? parseInt(data.max_participants) : null,
                has_certificate: data.has_certificate || false,
                is_group_event: data.is_group_event || false,
                min_group_size: data.min_group_size ? parseInt(data.min_group_size) : null,
                max_group_size: data.max_group_size ? parseInt(data.max_group_size) : null,
                owner_id: userId,
            },
        });
    }

    async findAll() {
        return this.prisma.event.findMany({
            include: {
                owner: { select: { id: true, name: true, email: true } },
                _count: { select: { participants: true } }
            },
            orderBy: { created_at: 'desc' },
        });
    }

    async findOne(id: string) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, name: true, email: true } },
                _count: { select: { participants: true } }
            },
        });
        if (!event) throw new NotFoundException('Evento não encontrado');
        return event;
    }

    async update(id: string, data: any) {
        return this.prisma.event.update({
            where: { id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.location !== undefined && { location: data.location }),
                ...(data.date !== undefined && { date: data.date ? new Date(data.date) : null }),
                ...(data.end_date !== undefined && { end_date: data.end_date ? new Date(data.end_date) : null }),
                ...(data.max_participants !== undefined && { max_participants: data.max_participants ? parseInt(data.max_participants) : null }),
                ...(data.is_active !== undefined && { is_active: data.is_active }),
                ...(data.is_registration_open !== undefined && { is_registration_open: data.is_registration_open }),
                ...(data.has_certificate !== undefined && { has_certificate: data.has_certificate }),
                ...(data.is_group_event !== undefined && { is_group_event: data.is_group_event }),
                ...(data.min_group_size !== undefined && { min_group_size: data.min_group_size ? parseInt(data.min_group_size) : null }),
                ...(data.max_group_size !== undefined && { max_group_size: data.max_group_size ? parseInt(data.max_group_size) : null }),
            },
        });
    }

    async remove(id: string) {
        await this.prisma.event.delete({ where: { id } });
        return { success: true };
    }

    async registerParticipant(eventId: string, userId: string) {
        const event = await this.prisma.event.findUnique({ where: { id: eventId } });
        if (!event) throw new NotFoundException('Evento não encontrado');
        if (!event.is_registration_open) throw new ConflictException('Inscrições fechadas');

        const existing = await this.prisma.eventParticipant.findUnique({
            where: { event_id_user_id: { event_id: eventId, user_id: userId } },
        });
        if (existing) throw new ConflictException('Já inscrito neste evento');

        if (event.max_participants) {
            const count = await this.prisma.eventParticipant.count({ where: { event_id: eventId } });
            if (count >= event.max_participants) throw new ConflictException('Limite de participantes atingido');
        }

        return this.prisma.eventParticipant.create({
            data: { event_id: eventId, user_id: userId },
        });
    }

    async unregisterParticipant(eventId: string, userId: string) {
        await this.prisma.eventParticipant.delete({
            where: { event_id_user_id: { event_id: eventId, user_id: userId } },
        });
        return { success: true };
    }
}
