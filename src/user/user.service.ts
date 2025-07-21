import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, Children, Note } from '@prisma/client';
import {
  CreateUserDto,
  UpdateUserDto,
  CreateChildDto,
  UpdateChildDto,
  CreateNoteDto,
  UpdateNoteDto,
} from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: {
        Children: true,
        Note: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  async findOne(uuid: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { uuid },
      include: {
        Children: true,
        Note: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getChildren(userUuid: string): Promise<Children[]> {
    const user = await this.findOne(userUuid);

    return this.prisma.children.findMany({
      where: { userId: user.id },
    });
  }

  async createChild(userUuid: string, data: CreateChildDto): Promise<Children> {
    const user = await this.findOne(userUuid);

    return this.prisma.children.create({
      data: {
        ...data,
        userId: user.id,
      },
    });
  }

  async updateChild(
    userUuid: string,
    childUuid: string,
    data: UpdateChildDto,
  ): Promise<Children> {
    const user = await this.findOne(userUuid);

    const child = await this.prisma.children.findFirst({
      where: {
        uuid: childUuid,
        userId: user.id,
      },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    return this.prisma.children.update({
      where: { uuid: childUuid },
      data,
    });
  }

  async removeChild(userUuid: string, childUuid: string): Promise<Children> {
    const user = await this.findOne(userUuid);

    const child = await this.prisma.children.findFirst({
      where: {
        uuid: childUuid,
        userId: user.id,
      },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    return this.prisma.children.delete({
      where: { uuid: childUuid },
    });
  }

  async getNotes(userUuid: string): Promise<Note[]> {
    const user = await this.findOne(userUuid);

    return this.prisma.note.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
      },
      include: {
        accessToken: true,
      },
    });
  }

  async getNote(userUuid: string, noteUuid: string): Promise<Note> {
    const user = await this.findOne(userUuid);

    const note = await this.prisma.note.findFirst({
      where: {
        uuid: noteUuid,
        userId: user.id,
        deletedAt: null,
      },
      include: {
        accessToken: true,
        NoteEditHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async createNote(userUuid: string, data: CreateNoteDto): Promise<Note> {
    const user = await this.findOne(userUuid);

    return this.prisma.note.create({
      data: {
        ...data,
        userId: user.id,
      },
    });
  }

  async updateNote(
    userUuid: string,
    noteUuid: string,
    data: UpdateNoteDto,
  ): Promise<Note> {
    const user = await this.findOne(userUuid);

    const note = await this.prisma.note.findFirst({
      where: {
        uuid: noteUuid,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return this.prisma.note.update({
      where: { uuid: noteUuid },
      data,
    });
  }

  async removeNote(userUuid: string, noteUuid: string): Promise<Note> {
    const user = await this.findOne(userUuid);

    const note = await this.prisma.note.findFirst({
      where: {
        uuid: noteUuid,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return this.prisma.note.update({
      where: { uuid: noteUuid },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
