import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SyncTrackingDto } from './tracking.controller';

@Injectable()
export class TrackingService {
    constructor(private readonly prisma: PrismaService) { }

    async processOfflineSync(eventId: string, dto: SyncTrackingDto) {
        const serverStart = Date.now();
        const deviceStart = new Date(dto.check_in_device_time).getTime();
        const offsetMs = serverStart - deviceStart;

        const event = await this.prisma.trekking.findUnique({ where: { id: eventId } });
        if (!event) throw new BadRequestException('Trekking not found');

        const recordsToInsert = dto.records.map((rec) => {
            const originalTime = new Date(rec.device_time);
            const readAt = new Date(originalTime.getTime() + offsetMs);

            return {
                trekking_id: eventId,
                team_id: dto.team_id,
                qr_hash: rec.qr_hash,
                device_time: originalTime,
                read_at: readAt,
            };
        });

        const result = await this.prisma.trackingRecord.createMany({
            data: recordsToInsert,
        });

        return result;
    }
}
