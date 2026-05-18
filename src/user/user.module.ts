import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';
import { AttachmentUrlService } from './attachment-url.service';

@Module({
  imports: [AuthModule, HttpModule],
  controllers: [UserController],
  providers: [UserService, PrismaService, AttachmentUrlService],
  exports: [UserService],
})
export class UserModule {}
