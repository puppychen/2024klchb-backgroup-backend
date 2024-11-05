import { Module } from '@nestjs/common';
import { FacilityService } from './facility.service';
import { FacilityController } from './facility.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FacilityController],
  providers: [FacilityService, PrismaService],
})
export class FacilityModule {}
