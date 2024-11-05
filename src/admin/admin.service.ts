// src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, Admin } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.AdminCreateInput): Promise<Admin> {
    return this.prisma.admin.create({ data });
  }

  async findAll(): Promise<Admin[]> {
    return this.prisma.admin.findMany();
  }

  async findOne(uuid: string): Promise<Admin | null> {
    return this.prisma.admin.findUnique({ where: { uuid } });
  }

  async update(uuid: string, data: Prisma.AdminUpdateInput): Promise<Admin> {
    return this.prisma.admin.update({
      where: { uuid },
      data,
    });
  }

  async delete(uuid: string): Promise<Admin> {
    return this.prisma.admin.delete({ where: { uuid } });
  }
}
