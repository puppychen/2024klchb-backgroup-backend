import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  lineId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  content?: any;
}
