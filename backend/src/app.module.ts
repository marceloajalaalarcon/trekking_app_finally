import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { TrackingModule } from './tracking/tracking.module';
import { CertificatesModule } from './certificates/certificates.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsStandardModule } from './events-standard/events-standard.module';
import { TeamsModule } from './teams/teams.module';

@Module({
  imports: [TrackingModule, CertificatesModule, EventsModule, AuthModule, UsersModule, EventsStandardModule, TeamsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
