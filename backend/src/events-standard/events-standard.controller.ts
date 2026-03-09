import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { EventsStandardService } from './events-standard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SystemRole } from '@prisma/client';

@Controller('events-standard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsStandardController {
    constructor(private readonly service: EventsStandardService) { }

    @Roles(SystemRole.STANDARD_CREATOR)
    @Post()
    create(@Body() body: any, @Request() req: any) {
        return this.service.create(body, req.user.userId);
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Roles(SystemRole.STANDARD_CREATOR)
    @Put(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.service.update(id, body);
    }

    @Roles(SystemRole.STANDARD_CREATOR)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }

    @Post(':id/register')
    register(@Param('id') id: string, @Request() req: any) {
        return this.service.registerParticipant(id, req.user.userId);
    }

    @Delete(':id/register')
    unregister(@Param('id') id: string, @Request() req: any) {
        return this.service.unregisterParticipant(id, req.user.userId);
    }
}
