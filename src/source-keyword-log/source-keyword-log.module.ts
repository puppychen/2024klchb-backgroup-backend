import { Module } from '@nestjs/common';
import { SourceKeywordLogController } from './source-keyword-log.controller';
import { SourceKeywordLogService } from './source-keyword-log.service';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SourceKeywordLogController],
  providers: [SourceKeywordLogService, PrismaService],
})
export class SourceKeywordLogModule {}
