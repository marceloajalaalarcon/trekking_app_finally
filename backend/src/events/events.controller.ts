import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('trekkings')
@UseGuards(JwtAuthGuard)
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Get()
    findAll() {
        return this.eventsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }

    @Post()
    create(@Body() data: { name: string; description?: string; location?: string; teams_start_interval: number; checkpoints_count: number; start_date?: string; end_date?: string; is_registration_open?: boolean; is_tracking?: boolean; has_extra_activities?: boolean }) {
        return this.eventsService.create(data);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.eventsService.update(id, data);
    }

    @Get(':id/roles')
    getRoles(@Param('id') id: string) {
        return this.eventsService.getRoles(id);
    }

    @Post(':id/roles')
    createRole(@Param('id') id: string, @Body() data: { name: string; permissions: number }) {
        return this.eventsService.createRole(id, data);
    }

    @Put(':id/roles/:roleId')
    updateRole(@Param('id') id: string, @Param('roleId') roleId: string, @Body() data: { name: string; permissions: number }) {
        return this.eventsService.updateRole(id, roleId, data);
    }

    @Delete(':id/roles/:roleId')
    deleteRole(@Param('id') id: string, @Param('roleId') roleId: string) {
        return this.eventsService.deleteRole(id, roleId);
    }

    @Get(':id/members')
    getMembers(@Param('id') id: string) {
        return this.eventsService.getMembers(id);
    }

    @Post(':id/members')
    addMember(@Param('id') id: string, @Body() data: { email: string; role_id: string; password?: string }) {
        return this.eventsService.addMember(id, data.email, data.role_id, data.password);
    }

    @Delete(':id/members/:userId')
    removeMember(@Param('id') id: string, @Param('userId') userId: string) {
        return this.eventsService.removeMember(id, userId);
    }

    @Post(':id/register')
    registerTeam(@Param('id') id: string, @Body() body: { team_id: string }) {
        return this.eventsService.registerTeam(id, body.team_id);
    }

    @Delete(':id/register/:teamId')
    unregisterTeam(@Param('id') id: string, @Param('teamId') teamId: string) {
        return this.eventsService.unregisterTeam(id, teamId);
    }

    @Get(':id/ranking')
    getRanking(@Param('id') id: string) {
        return this.eventsService.getRanking(id);
    }
}
