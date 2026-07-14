import { IsIn, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCriterionDto {
  @IsString()
  @MinLength(2)
  label: string;

  @IsOptional()
  @IsIn(['M', 'E', 'R', 'C', 'I'])
  dimension?: string;

  @IsNumber()
  target: number;

  @IsOptional()
  @IsString()
  unit?: string;
}
