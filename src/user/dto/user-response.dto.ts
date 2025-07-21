import { Exclude, Expose, Type, plainToInstance } from 'class-transformer';
import { User } from '@prisma/client';

class ChildResponseDto {
  @Exclude()
  id: number;

  @Exclude()
  userId: number;

  @Expose()
  uuid: string;

  @Expose()
  name: string;

  @Expose()
  birthDate: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

class NoteResponseDto {
  @Exclude()
  id: number;

  @Exclude()
  userId: number;

  @Expose()
  uuid: string;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date | null;
}

export class UserResponseDto {
  @Exclude()
  id: number;

  @Expose()
  uuid: string;

  @Expose()
  lineId: string;

  @Expose()
  name: string | null;

  @Expose()
  content: any | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => ChildResponseDto)
  Children?: ChildResponseDto[];

  @Expose()
  @Type(() => NoteResponseDto)
  Note?: NoteResponseDto[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  static from(user: any): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      strategy: 'excludeAll',
    });
  }

  static fromArray(users: any[]): UserResponseDto[] {
    return plainToInstance(UserResponseDto, users, {
      strategy: 'excludeAll',
    });
  }
}
