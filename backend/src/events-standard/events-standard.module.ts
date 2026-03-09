import { Module } from '@nestjs/common';
import { EventsStandardService } from './events-standard.service';
import { EventsStandardController } from './events-standard.controller';
import { PrismaService } from '../prisma.service';

@Module({
    providers: [EventsStandardService, PrismaService],
    controllers: [EventsStandardController],
})
export class EventsStandardModule { }
