import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Consultation } from './consultation.entity';

@Injectable()
export class ConsultationService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Consultation[]> {
    return this.prisma.consultation.findMany({
      include: {
        user: {
          select: {
            uuid: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(uuid: string): Promise<Consultation | null> {
    return this.prisma.consultation.findUnique({ where: { uuid } });
  }
}
