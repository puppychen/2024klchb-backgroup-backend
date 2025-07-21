import { Exclude, Expose, Type, plainToInstance } from 'class-transformer';
import { Note } from '@prisma/client';
import { NoteEditHistoryResponseDto } from './note-edit-history-response.dto';

export class NoteResponseDto {
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

  @Exclude()
  deletedAt: Date | null;

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