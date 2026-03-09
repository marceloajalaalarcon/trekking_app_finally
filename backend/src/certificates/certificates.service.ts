import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class CertificatesService {
    constructor(private readonly prisma: PrismaService) { }

    async verify(hash: string) {
        const cert = await this.prisma.certificate.findUnique({
            where: { hash },
        });

        if (!cert) return null;

        return {
            valid: true,
            certificate: cert,
        };
    }

    async generate(data: { trekking_id?: string; event_id?: string; user_id: string; participant_name?: string }) {
        const hash = crypto.randomBytes(16).toString('hex');

        return this.prisma.certificate.create({
            data: {
                trekking_id: data.trekking_id || null,
                event_id: data.event_id || null,
                user_id: data.user_id,
                participant_name: data.participant_name || null,
                hash,
            },
        });
    }

    async generateBatch(data: { trekking_id?: string; event_id?: string; participants: { user_id: string; participant_name?: string }[] }) {
        const certificates = data.participants.map(p => ({
            trekking_id: data.trekking_id || null,
            event_id: data.event_id || null,
            user_id: p.user_id,
            participant_name: p.participant_name || null,
            hash: crypto.randomBytes(16).toString('hex'),
        }));

        await this.prisma.certificate.createMany({ data: certificates });
        return { count: certificates.length, success: true };
    }

    async findByEvent(eventId: string) {
        return this.prisma.certificate.findMany({
            where: { event_id: eventId },
            orderBy: { issued_at: 'desc' },
        });
    }

    async findByTrekking(trekkingId: string) {
        return this.prisma.certificate.findMany({
            where: { trekking_id: trekkingId },
            orderBy: { issued_at: 'desc' },
        });
    }

    async remove(id: string) {
        const cert = await this.prisma.certificate.findUnique({ where: { id } });
        if (!cert) throw new NotFoundException('Certificado não encontrado');
        await this.prisma.certificate.delete({ where: { id } });
        return { success: true };
    }

    async findByUser(userId: string) {
        return this.prisma.certificate.findMany({
            where: { user_id: userId },
            orderBy: { issued_at: 'desc' },
        });
    }
}
