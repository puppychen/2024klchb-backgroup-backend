import { Exclude, Expose, Type, plainToInstance } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Note } from '@prisma/client';
import { NoteEditHistoryResponseDto } from './note-edit-history-response.dto';

export class NoteResponseDto {
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

  @Exclude()
  deletedAt: Date | null;

  @ApiProperty({
    description: '筆記編輯歷史',
    type: [NoteEditHistoryResponseDto],
    required: false,
  })
  @Expose()
  @Type(() => NoteEditHistoryResponseDto)
  NoteEditHistory?: NoteEditHistoryResponseDto[];

  constructor(partial: Partial<Note>) {
    Object.assign(this, partial);
  }

  static from(note: any): NoteResponseDto {
    return plainToInstance(NoteResponseDto, note, {
      strategy: 'excludeAll',
    });
  }

  static fromArray(notes: any[]): NoteResponseDto[] {
    return plainToInstance(NoteResponseDto, notes, {
      strategy: 'excludeAll',
    });
  }
}
