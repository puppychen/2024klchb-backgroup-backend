import { Exclude, Expose, Type, plainToInstance } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

class ChildResponseDto {
  @Exclude()
  id: number;

  @Exclude()
  userId: number;

  @ApiProperty({ description: '子女資料 UUID' })
  @Expose()
  uuid: string;

  @ApiProperty({ description: '子女姓名' })
  @Expose()
  name: string;

  @ApiProperty({ description: '出生日期' })
  @Expose()
  birthDate: Date;

  @ApiProperty({ description: '建立時間' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: '更新時間' })
  @Expose()
  updatedAt: Date;
}

class NoteResponseDto {
  @Exclude()
  id: number;

  @Exclude()
  userId: number;

  @ApiProperty({ description: '筆記 UUID' })
  @Expose()
  uuid: string;

  @ApiProperty({ description: '筆記標題' })
  @Expose()
  title: string;

  @ApiProperty({ description: '筆記內容' })
  @Expose()
  content: string;

  @ApiProperty({ description: '建立時間' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: '更新時間' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: '刪除時間', nullable: true })
  @Expose()
  deletedAt: Date | null;
}

export class UserResponseDto {
  @Exclude()
  id: number;

  @ApiProperty({ description: '用戶 UUID' })
  @Expose()
  uuid: string;

  @ApiProperty({ description: 'LINE ID' })
  @Expose()
  lineId: string;

  @ApiProperty({ description: '用戶姓名', nullable: true })
  @Expose()
  name: string | null;

  @ApiProperty({ description: '用戶附加資料', nullable: true })
  @Expose()
  content: any | null;

  @ApiProperty({ description: '建立時間' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: '更新時間' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    description: '子女資料列表',
    type: [ChildResponseDto],
    required: false,
  })
  @Expose()
  @Type(() => ChildResponseDto)
  Children?: ChildResponseDto[];

  @ApiProperty({
    description: '筆記列表',
    type: [NoteResponseDto],
    required: false,
  })
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
