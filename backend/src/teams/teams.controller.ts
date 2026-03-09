import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    @Get('my')
    getMyTeams(@Request() req: any) {
        return this.teamsService.getMyTeams(req.user.userId);
    }

    @Post()
    create(@Body() body: { name: string }, @Request() req: any) {
        return this.teamsService.create(body.name, req.user.userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.teamsService.findOne(id);
    }

    @Post(':id/invite')
    invite(@Param('id') id: string, @Body() body: { email: string }, @Request() req: any) {
        return this.teamsService.invite(id, body.email, req.user.userId);
    }

    @Post(':id/leave')
    leave(@Param('id') id: string, @Request() req: any) {
        return this.teamsService.leave(id, req.user.userId);
    }

    @Delete(':id/members/:userId')
    removeMember(@Param('id') id: string, @Param('userId') userId: string, @Request() req: any) {
        return this.teamsService.removeMember(id, userId, req.user.userId);
    }
}
