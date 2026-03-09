import { Controller, Get, Post, Delete, Param, Body, NotFoundException, UseGuards, Request } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SystemRole } from '@prisma/client';

@Controller('certificates')
export class CertificatesController {
    constructor(private readonly certificatesService: CertificatesService) { }

    // Rota pública — qualquer pessoa pode verificar um certificado
    @Get('verify/:hash')
    async verifyCertificate(@Param('hash') hash: string) {
        const certificate = await this.certificatesService.verify(hash);
        if (!certificate) {
            throw new NotFoundException('Certificado não encontrado ou inválido');
        }
        return certificate;
    }

    @UseGuards(JwtAuthGuard)
    @Get('my')
    findMyCertificates(@Request() req: any) {
        return this.certificatesService.findByUser(req.user.userId);
    }

    // Gerar certificado individual — TREKKING_CREATOR e STANDARD_CREATOR
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.TREKKING_CREATOR, SystemRole.STANDARD_CREATOR)
    @Post()
    generate(@Body() body: any) {
        return this.certificatesService.generate(body);
    }

    // Gerar certificados em lote
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.TREKKING_CREATOR, SystemRole.STANDARD_CREATOR)
    @Post('batch')
    generateBatch(@Body() body: any) {
        return this.certificatesService.generateBatch(body);
    }

    // Listar certificados por evento padrão
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.STANDARD_CREATOR)
    @Get('event/:eventId')
    findByEvent(@Param('eventId') eventId: string) {
        return this.certificatesService.findByEvent(eventId);
    }

    // Listar certificados por trekking
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.TREKKING_CREATOR)
    @Get('trekking/:trekkingId')
    findByTrekking(@Param('trekkingId') trekkingId: string) {
        return this.certificatesService.findByTrekking(trekkingId);
    }

    // Remover certificado
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.TREKKING_CREATOR, SystemRole.STANDARD_CREATOR)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.certificatesService.remove(id);
    }
}
