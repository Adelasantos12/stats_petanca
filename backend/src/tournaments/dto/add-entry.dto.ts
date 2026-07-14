import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class AddEntryDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsInt()
  seed?: number;
}
