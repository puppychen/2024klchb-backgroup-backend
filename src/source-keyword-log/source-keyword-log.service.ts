import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SourceKeywordLogService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.sourceKeywordLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
