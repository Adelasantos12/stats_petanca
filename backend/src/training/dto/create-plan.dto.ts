import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class PlanItemInput {
  @IsString()
  drillId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  week?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  reps?: number;
}

export class CreatePlanDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  focus?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PlanItemInput)
  items: PlanItemInput[];
}
