import { Exclude, Expose, plainToInstance } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { NoteEditHistory } from '@prisma/client';

export class NoteEditHistoryResponseDto {
  @Exclude()
  id: number;

  @Exclude()
  noteId: number;

  @Exclude()
  accessTokenId: number | null;

  @ApiProperty({ description: '編輯歷史 UUID' })
  @Expose()
  uuid: string;

  @ApiProperty({ description: '編輯前內容', nullable: true })
  @Expose()
  beforeContent: string | null;

  @ApiProperty({ description: '編輯後內容', nullable: true })
  @Expose()
  afterContent: string | null;

  @ApiProperty({ description: '建立時間' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: '更新時間' })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<NoteEditHistory>) {
    Object.assign(this, partial);
  }

  static from(history: any): NoteEditHistoryResponseDto {
    return plainToInstance(NoteEditHistoryResponseDto, history, {
      strategy: 'excludeAll',
    });
  }

  static fromArray(histories: any[]): NoteEditHistoryResponseDto[] {
    return plainToInstance(NoteEditHistoryResponseDto, histories, {
      strategy: 'excludeAll',
    });
  }
}
