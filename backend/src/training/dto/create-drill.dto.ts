import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateDrillDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsIn(['M', 'E', 'R', 'C', 'I'])
  dimension: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  targetMetric?: string;
}
