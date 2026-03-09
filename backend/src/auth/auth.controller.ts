import { Controller, Post, Body, UnauthorizedException, Get, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    async register(@Body() req: any) {
        return this.authService.register({
            name: req.name,
            email: req.email,
            password: req.password,
        });
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() req: any) {
        const user = await this.authService.validateUser(req.email, req.password);
        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas');
        }
        return this.authService.login(user);
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refresh(@Body() req: any) {
        if (!req.refresh_token) {
            throw new UnauthorizedException('Refresh token não fornecido');
        }
        return this.authService.refresh(req.refresh_token);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(@Body() req: any) {
        if (!req.refresh_token) {
            return { success: true }; // Already logged out or no token provided
        }
        return this.authService.logout(req.refresh_token);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req: any) {
        return req.user;
    }
}
