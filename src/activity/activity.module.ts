import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { PrismaService } from '../prisma.service';
import { AttachmentUrlService } from '../user/attachment-url.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ActivityController],
  providers: [ActivityService, PrismaService, AttachmentUrlService],
})
export class ActivityModule {}
