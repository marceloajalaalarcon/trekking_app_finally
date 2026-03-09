import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { jwtConstants } from './constants';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && await bcrypt.compare(pass, user.password_hash)) {
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }

    async register(data: { name: string; email: string; password: string }) {
        const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            throw new ConflictException('Email já está em uso.');
        }

        const hash = await bcrypt.hash(data.password, 10);
        const user = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password_hash: hash,
            },
        });

        const { password_hash, ...result } = user;
        return this.login(result);
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };

        // Generate tokens
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
            secret: jwtConstants.refreshSecret,
            expiresIn: '30d'
        });

        // Save refresh token to database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                user_id: user.id,
                expires_at: expiresAt
            }
        });

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        };
    }

    async refresh(token: string) {
        try {
            const payload = this.jwtService.verify(token, { secret: jwtConstants.refreshSecret });

            // Check if the token exists and is valid in the database
            const storedToken = await this.prisma.refreshToken.findUnique({
                where: { token }
            });

            if (!storedToken || storedToken.expires_at < new Date()) {
                throw new UnauthorizedException('Invalid or expired refresh token');
            }

            const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const newPayload = { email: user.email, sub: user.id, role: user.role };
            const newAccessToken = this.jwtService.sign(newPayload);

            return {
                access_token: newAccessToken
            };
        } catch (e) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async logout(token: string) {
        await this.prisma.refreshToken.deleteMany({
            where: { token }
        });
        return { success: true };
    }
}
