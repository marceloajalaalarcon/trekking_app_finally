import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) { }

  getHello(): string {
    return 'Hello World!';
  }

  async processStaffCheckin(barcode: string) {
    if (!barcode) throw new BadRequestException('Barcode is required');

    // T-TEAMID-EEVENTID or U-USERID-EEVENTID
    const isTrekking = barcode.startsWith('T');
    const isStandard = barcode.startsWith('U');

    if (!isTrekking && !isStandard) {
      throw new BadRequestException('Formato de ingresso inválido');
    }

    const parts = barcode.split('-');
    if (parts.length !== 2) throw new BadRequestException('Formato de ingresso inválido');

    const entityShort = parts[0].substring(1).toLowerCase(); // team or user short id
    const eventShort = parts[1].substring(1).toLowerCase(); // event short id

    if (isStandard) {
      const registrations = await this.prisma.eventParticipant.findMany({
        where: {
          user_id: { startsWith: entityShort },
          event_id: { startsWith: eventShort }
        },
        include: { user: true, event: true }
      });

      if (registrations.length === 0) throw new NotFoundException('Ingresso não encontrado');
      if (registrations.length > 1) throw new ConflictException('Múltiplos ingressos encontrados (colisão)');

      const reg = registrations[0];
      if (reg.status === 'CONFIRMED' || reg.status === 'CHECKED_IN') {
        return { success: true, message: 'Ingresso já validado anteriormente!', participant: reg.user.name, event: reg.event.name, alreadyCheckedIn: true };
      }

      await this.prisma.eventParticipant.update({
        where: { id: reg.id },
        data: { status: 'CONFIRMED' }
      });

      return { success: true, message: 'Check-in realizado com sucesso!', participant: reg.user.name, event: reg.event.name, alreadyCheckedIn: false };
    } else {
      const registrations = await this.prisma.trekkingTeam.findMany({
        where: {
          team_id: { startsWith: entityShort },
          trekking_id: { startsWith: eventShort }
        },
        include: { team: true, trekking: true }
      });

      if (registrations.length === 0) throw new NotFoundException('Equipe/Ingresso não encontrado');
      if (registrations.length > 1) throw new ConflictException('Múltiplos ingressos encontrados (colisão)');

      const reg = registrations[0];
      if (reg.status === 'ACTIVE' || reg.status === 'CHECKED_IN' || reg.status === 'COMPLETED') {
        return { success: true, message: 'Equipe já validada anteriormente!', participant: reg.team.name, event: reg.trekking.name, alreadyCheckedIn: true };
      }

      await this.prisma.trekkingTeam.update({
        where: { trekking_id_team_id: { trekking_id: reg.trekking_id, team_id: reg.team_id } },
        data: { status: 'ACTIVE' }
      });

      return { success: true, message: 'Check-in da equipe liberado com sucesso!', participant: reg.team.name, event: reg.trekking.name, alreadyCheckedIn: false };
    }
  }
}
