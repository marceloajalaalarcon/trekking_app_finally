import { Controller, Post, Body, Param, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

export class SyncTrackingDto {
    records: {
        qr_hash: string;
        device_time: string;
    }[];
    check_in_server_time: string;
    check_in_device_time: string;
    team_id: string;
}

@Controller('trekkings/:id/tracking')
@UseGuards(JwtAuthGuard)
export class TrackingController {
    constructor(private readonly trackingService: TrackingService) { }

    @Post('sync')
    async syncTracking(
        @Param('id') eventId: string,
        @Body() dto: SyncTrackingDto,
    ) {
        if (!dto.records || !dto.check_in_server_time || !dto.check_in_device_time) {
            throw new HttpException('Invalid sync payload', HttpStatus.BAD_REQUEST);
        }

        try {
            const result = await this.trackingService.processOfflineSync(eventId, dto);
            return { success: true, processed: result.count };
        } catch (e: any) {
            throw new HttpException(e.message || 'Error processing sync', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
