import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsInt()
  @IsOptional()
  accessTokenId?: number;
}
