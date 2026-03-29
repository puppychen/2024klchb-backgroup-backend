import { Expose, Transform, plainToInstance } from 'class-transformer';

export class SourceKeywordLogResponseDto {
  @Expose() id!: number;
  @Expose() uuid!: string;
  @Expose() lineId!: string;
  @Expose() action!: string;
  @Expose() newKeyword!: string;
  @Expose() newSourceName!: string;
  @Expose() oldKeyword!: string | null;
  @Expose() oldSourceName!: string | null;
  @Expose() createdAt!: Date;

  @Expose()
  @Transform(({ obj }) => obj.user?.name || null)
  userName!: string | null;

  @Expose()
  @Transform(({ obj }) => obj.user?.pictureUrl || null)
  userPictureUrl!: string | null;

  static from(data: any): SourceKeywordLogResponseDto {
    return plainToInstance(SourceKeywordLogResponseDto, data, {
      strategy: 'excludeAll',
    });
  }

  static fromArray(data: any[]): SourceKeywordLogResponseDto[] {
    return data.map((item) => SourceKeywordLogResponseDto.from(item));
  }
}
