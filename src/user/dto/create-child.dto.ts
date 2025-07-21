import { IsString, IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateChildDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  birthday: string;

  @IsInt()
  @Min(0)
  months: number;
}
