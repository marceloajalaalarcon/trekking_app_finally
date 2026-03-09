import { Controller, Post, Get, Delete, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SystemRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me/stats')
    getMyStats(@Request() req: any) {
        return this.usersService.getStats(req.user.userId);
    }

    @Get('me/events')
    getMyEvents(@Request() req: any) {
        return this.usersService.getMyEvents(req.user.userId);
    }

    @Get('me/staff-roles')
    getMyStaffRoles(@Request() req: any) {
        return this.usersService.getMyStaffRoles(req.user.userId);
    }

    @Put('me')
    updateProfile(@Request() req: any, @Body() data: { name?: string; email?: string }) {
        return this.usersService.updateProfile(req.user.userId, data);
    }

    @Roles(SystemRole.DEVELOPER)
    @Post()
    create(@Body() createUserDto: { name: string; email: string; password_hash: string; role: SystemRole }) {
        return this.usersService.create(createUserDto);
    }

    @Roles(SystemRole.DEVELOPER)
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Roles(SystemRole.DEVELOPER)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
