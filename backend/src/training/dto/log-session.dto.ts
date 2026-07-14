import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class SessionResultInput {
  @IsOptional()
  @IsString()
  drillId?: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  attempts?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  successes?: number;

  @IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  avgScore?: number;

  @IsOptional()
  @IsBoolean()
  done?: boolean;
}

export class LogSessionDto {
  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  mood?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionResultInput)
  results?: SessionResultInput[];
}
