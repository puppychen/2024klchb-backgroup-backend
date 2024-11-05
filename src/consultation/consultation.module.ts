import { Module } from '@nestjs/common';
import { ConsultationController } from './consultation.controller';
import { ConsultationService } from './consultation.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ConsultationController],
  providers: [ConsultationService, PrismaService],
})
export class ConsultationModule {}
