import { Exclude, Expose, plainToInstance } from 'class-transformer';
import { NoteEditHistory } from '@prisma/client';

export class NoteEditHistoryResponseDto {
  @Exclude()
  id: number;

  @Exclude()
  noteId: number;

  @Exclude()
  accessTokenId: number | null;

  @Expose()
  uuid: string;

  @Expose()
  beforeContent: string | null;

  @Expose()
  afterContent: string | null;

  @Expose()
  createdAt: Date;

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
