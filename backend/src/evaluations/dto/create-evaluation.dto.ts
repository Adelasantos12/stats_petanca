import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class EvaluationItemInput {
  @IsOptional()
  @IsString()
  criterionId?: string;

  @IsString()
  label: string;

  @IsNumber()
  target: number;

  @IsInt()
  @Min(1)
  attempts: number;

  @IsInt()
  @Min(0)
  successes: number;
}

export class CreateEvaluationDto {
  @IsOptional()
  @IsString()
  targetLevelId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EvaluationItemInput)
  items: EvaluationItemInput[];
}
