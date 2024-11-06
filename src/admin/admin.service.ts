import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Admin } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateAdminServiceDto, UpdateAdminServiceDto } from './dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAdminServiceDto): Promise<Admin> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.admin.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async update(uuid: string, data: UpdateAdminServiceDto): Promise<Admin> {
    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.password = hashedPassword;
    } else {
      delete data.password;
    }
    return this.prisma.admin.update({
      where: { uuid },
      data,
    });
  }

  async findAll(): Promise<Admin[]> {
    return this.prisma.admin.findMany();
  }

  async findOne(uuid: string): Promise<Admin | null> {
    return this.prisma.admin.findUnique({ where: { uuid } });
  }

  async delete(uuid: string): Promise<Admin> {
    return this.prisma.admin.delete({ where: { uuid } });
  }
}
